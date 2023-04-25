<template>
    <PageTable :paginated-items="paginatedItems" :sort-field="sortField" :sort-order="sortOrder" :on-page-change="p => paginatedItems.currentPage = p" :on-sort="onSort">
        <template #actions="props">
            <slot name="actions" :row="props.row"></slot>
        </template>
    </PageTable>
</template>

<script>
import PageTable from "../PageTable.vue";
import PagesApi from "../../PagesApi.js";

export default {
    name: "PageList",
    components: {PageTable},
    data() {
        return {
            searchQuery: '',
            sortField: this.defaultSortField,
            sortOrder: this.defaultSortOrder,
            paginatedItems: {items: [], totalItems: 0, itemsPerPage: 0, loading: false, currentPage: 1},
            pagesApi: new PagesApi()
        }
    },
    watch: {
        'paginatedItems.currentPage': 'fetchData',
        'searchQuery': 'fetchData',
        'sortField': 'fetchData',
        'sortOrder': 'fetchData'
    },
    created() {
        this.fetchData()
    },
    methods: {
        onSort(field, order) {
            this.sortField = field;
            this.sortOrder = order;
        },
        async fetchData() {
            if(this.paginatedItems.loading) {
                return;
            }
            this.paginatedItems.loading = true;
            this.paginatedItems.items = [];

            let data = await this.pagesApi.list({
                q: this.searchQuery,
                inTrash: false,
                page: this.paginatedItems.currentPage,
                sortField: this.sortField,
                sortOrder: this.sortOrder
            });

            this.paginatedItems.items = data.items;
            this.paginatedItems.loading = false;
            this.paginatedItems.itemsPerPage = data.itemsPerPage;
            this.paginatedItems.totalItems = data.totalItems;
        }
    }
}
</script>

<style scoped>

</style>