<template>
    <b-table
        ref="table"
        :data="(paginatedItems === null || paginatedItems.items === null) ? [] : paginatedItems.items"
        :loading="paginatedItems === null || paginatedItems.items === null || paginatedItems.loading"
        custom-row-key="id"
        :paginated="paginatedItems !== null && (paginatedItems.totalItems > paginatedItems.itemsPerPage)"
        backend-pagination
        :total="paginatedItems !== null ? paginatedItems.totalItems : 0"
        :per-page="paginatedItems !== null ? paginatedItems.itemsPerPage : 0"
        :current-page="paginatedItems !== null ? paginatedItems.currentPage : 1"
        :detailed="false"
        :backend-sorting="!!onSort"
        default-sort-direction="asc"
        :default-sort="[sortField, sortOrder]"
        sticky-header
        aria-next-label="Next page"
        aria-previous-label="Previous page"
        aria-page-label="Page"
        aria-current-label="Current page"
        class="full-height-flex full-height-container"
        @page-change="onPageChange"
        @sort="onSort">
        <b-table-column v-slot="props" label="Title" :sortable="!!onSort" field="title">{{ props.row.title }} <PartialStatusIcon :item="props.row"></PartialStatusIcon></b-table-column>
        <b-table-column v-slot="props" label="Key"  :sortable="!!onSort" field="key">{{ props.row.key }}</b-table-column>
        <b-table-column v-slot="props" label="Last Updated" field="updatedAt" :sortable="!!onSort">
            <div v-if="props.row.updatedAt" class="is-size-7"><Updated :model="props.row"></Updated></div>
        </b-table-column>
        <b-table-column v-slot="props">
            <slot name="actions" :row="props.row"></slot>
        </b-table-column>
    </b-table>
</template>

<script>
import Updated from "../Updated.vue";
import PartialStatusIcon from "./PartialStatusIcon.vue";

export default {
    name: "PartialTable",
    components: {PartialStatusIcon, Updated},
    props: {
        detailed: Boolean,
        sortField: String,
        sortOrder: String,
        onSort: { type: Function, default: () => {} },
        paginatedItems: { type: Object, default: null },
        onPageChange: Function,
    },
    data() {
        return {
        }
    },
    watch: {
    },
    methods: {
    }
}
</script>

<style scoped lang="scss">
    ::v-deep .table-wrapper.has-sticky-header {
        flex: 1 1 auto;
    }
</style>