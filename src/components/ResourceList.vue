<template>
    <div class="full-height full-height-container pad">
        <div class="top-bar">
            <h1 v-if="!inTrash" class="title">{{ displayName }}</h1>
            <b-button v-if="inTrash" tag="router-link" :to="'/' + routePrefix + '/'" outlined rounded icon-left="arrow-left">All {{ displayName }}</b-button>
            <h1 v-if="inTrash" class="title">
                Deleted {{ displayName }}
            </h1>
            <div class="is-flex-grow-1">
            </div>
            <b-input v-model.lazy="searchQuery" rounded :placeholder="'Search ' + displayName" icon="search" icon-pack="fas" class="mr-3"></b-input>
            <b-button v-if="!inTrash" tag="router-link" :to="'/' + routePrefix + '/create'" type="is-success" icon-left="pencil-alt" class="mr-3">Create
                {{ singularDisplayName }}</b-button>
            <b-button v-if="!inTrash" tag="router-link" :to="'/' + routePrefix + '/trash'" type="is-danger" outlined icon-left="trash">Deleted
                {{ displayName }}</b-button>
        </div>

        <div class="full-height full-height-container box">
            <component :is="tableComponent" :paginated-items="paginatedItems" :on-page-change="page => paginatedItems.currentPage = page" :detailed="!searchQuery" :on-sort="onSort">
                <template #actions="slotProps">
                    <div class="buttons" style="min-width: 18rem">
                        <component :is="actionsComponent" :item="slotProps.row" @update="updateItem" @reload="fetchData"></component>
                        <b-button rounded icon-left="pencil-alt" tag="router-link" :to="'/' + routePrefix + '/' + slotProps.row.id" size="is-small">Edit</b-button>
                        <b-button
                            v-if="inTrash" rounded outlined icon-left="recycle"
                            size="is-small" @click="restoreItem(slotProps.row.id)">Restore
                        </b-button>
                        <b-button
                            v-if="inTrash" rounded type="is-danger" outlined icon-left="trash"
                            size="is-small" @click="forceDeleteItem(slotProps.row.id)">Delete Forever
                        </b-button>
                        <b-button
                            v-if="!inTrash" rounded icon-left="trash"
                            size="is-small" @click="deleteItem(slotProps.row.id)">Delete</b-button>
                    </div>
                </template>
            </component>
        </div>
    </div>
</template>

<script>
import ContentEditor from "./content/ContentEditor.vue";
import {debounce} from "lodash";

export default {
    name: "ResourceList",
    components: {ContentEditor},
    props: {
        routePrefix: String,
        displayName: String,
        singularDisplayName: String,
        inTrash: {
            type: Boolean,
            default: false
        },
        defaultSortField: String,
        defaultSortOrder: String,
        tableComponent: Object,
        actionsComponent: Object,
        resourceApi: Object
    },
    data() {
        return {
            searchQuery: '',
            sortField: this.defaultSortField,
            sortOrder: this.defaultSortOrder,
            paginatedItems: {items: [], totalItems: 0, itemsPerPage: 0, loading: false, currentPage: 1},
        }
    },
    watch: {
        'resourceApi': 'debouncedFetchData',
        'inTrash': 'debouncedFetchData',
        'sortField': 'debouncedFetchData',
        'sortOrder': 'debouncedFetchData',
        'searchQuery': 'debouncedFetchData',
        'paginatedItems.currentPage': 'debouncedFetchData'
    },
    created() {
        this.fetchData()
    },
    methods: {
        debouncedFetchData: debounce(async function() {
            await this.fetchData()
        }, 200),
        async fetchData() {
            if(this.paginatedItems.loading) {
                return;
            }
            this.paginatedItems.loading = true;
            this.paginatedItems.items = [];

            let data = await this.resourceApi.list({
                q: this.searchQuery,
                inTrash: this.inTrash,
                page: this.paginatedItems.currentPage,
                sortField: this.sortField,
                sortOrder: this.sortOrder
            });

            this.paginatedItems.items = data.items;
            this.paginatedItems.loading = false;
            this.paginatedItems.itemsPerPage = data.itemsPerPage;
            this.paginatedItems.totalItems = data.totalItems;
        },
        // updates a single item
        updateItem(item) {
            this.paginatedItems.items = this.paginatedItems.items.map(i => { return i.id === item.id ? item : i; });
        },
        onSort(field, order) {
            this.sortField = field;
            this.sortOrder = order;
        },
        async restoreItem(id) {
            await this.resourceApi.restoreAndNotify(id);
            await this.fetchData();
        },
        async forceDeleteItem(id) {
            await this.resourceApi.confirmForceDelete(id);
            await this.fetchData();
        },
        async deleteItem(id) {
            await this.resourceApi.deleteAndNotify(id);
            await this.fetchData();
        },
    }
}
</script>

<style scoped>
@import "./util.css";
</style>