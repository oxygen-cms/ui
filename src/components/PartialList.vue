<template>
    <div class="full-height-flex scroll-container">

        <b-loading v-model="paginatedItems.loading" :is-full-page="false" :can-cancel="false"></b-loading>

        <h2 v-if="!paginatedItems.loading && paginatedItems.items.length === 0" class="subtitle">
            No items found.
        </h2>

        <div
            v-for="item in paginatedItems.items"
            :key="item.id"
            class="card"
            @click="$emit('choose', item)">
            <span>{{ item.title }} ( <code>{{ item.key }}</code> )</span>
            <ContentEditor :editable="false" :content="item.richContent" />
        </div>
    </div>
</template>

<script>
import PartialsApi from "../PartialsApi.js";
import ContentEditor from "./content/ContentEditor.vue";

export default {
    name: "PartialList",
    components: {ContentEditor},
    props: {
        inTrash: {
            type: Boolean,
            default: false
        },
        searchQuery: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            partialsApi: new PartialsApi(),
            paginatedItems: {items: [], totalItems: 0, itemsPerPage: 0, loading: false, currentPage: 1},
        }
    },
    created() {
        this.fetchData()
    },
    methods: {
        async fetchData() {
            if(this.paginatedItems.loading) {
                return;
            }
            this.paginatedItems.loading = true;
            this.paginatedItems.items = [];

            let data = await this.partialsApi.list({ inTrash: this.inTrash, page: this.paginatedItems.currentPage, q: this.searchQuery });

            this.paginatedItems.items = data.items;
            this.paginatedItems.loading = false;
            this.paginatedItems.itemsPerPage = data.itemsPerPage;
            this.paginatedItems.totalItems = data.totalItems;

            console.log(data);
        }
    }
}
</script>

<style scoped>
    @import "./util.css";

    .card {
        cursor: pointer;
    }
</style>