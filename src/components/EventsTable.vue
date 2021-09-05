<template>
    <div>
        <b-table
                :data="paginatedItems === null || paginatedItems.items === null ? [] : paginatedItems.items"
                :checked-rows="checkedRows"
                :loading="paginatedItems.items === null || paginatedItems.loading"
                :checkable="checkable"
                custom-row-key="id"
                :paginated="paginatedItems.totalItems > paginatedItems.itemsPerPage"
                backend-pagination
                :total="paginatedItems.totalItems"
                :per-page="paginatedItems.itemsPerPage"
                :current-page="paginatedItems.currentPage"
                aria-next-label="Next page"
                @update:checkedRows="$emit('update:checkedRows', $event)"
                aria-previous-label="Previous page"
                aria-page-label="Page"
                aria-current-label="Current page"
                class="full-height-flex full-height-container"
                @page-change="onPageChange">
            <b-table-column v-slot="props" label="Title">
                {{ props.row.title }}
            </b-table-column>

            <b-table-column v-slot="props" label="Display on website">
                <em v-if="!props.row.active">No</em>
                <span v-else>{{ props.row.startDate ? new Date(props.row.startDate).toDateString() : '?'}} - {{ props.row.endDate ? new Date(props.row.endDate).toDateString() : '?'}}</span>
            </b-table-column>

            <b-table-column v-slot="props">
                <slot name="actions" :row="props.row"></slot>
            </b-table-column>

            <template slot="empty">
                <section class="section">
                    <div class="content has-text-grey has-text-centered">
                        <p>
                            <slot name="empty">
                                No events found.
                            </slot>
                        </p>
                    </div>
                </section>
            </template>
        </b-table>
    </div>
</template>

<script>
    export default {
        name: "EventsTable",
        props: {
            paginatedItems: Object,
            onPageChange: Function,
            checkedRows: {
                type: Array,
                default: () => { return []; }
            },
            checkable: Boolean
        },
        data() {
            return {
            };
        },
    }
</script>

<style scoped>
    .b-table {
        min-height: 10rem;
    }

    .b-table.is-loading {
        margin-bottom: 5rem;
    }
</style>
