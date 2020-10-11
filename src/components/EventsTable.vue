<template>
    <div>
        <b-table
                :data="paginatedItems === null || paginatedItems.items === null ? [] : paginatedItems.items"
                :checked-rows="checkedRows"
                v-on:update:checkedRows="$emit('update:checkedRows', $event)"
                :loading="paginatedItems.items === null || paginatedItems.loading"
                :checkable="checkable"
                custom-row-key="id"
                paginated
                backend-pagination
                :total="paginatedItems.totalItems"
                :per-page="paginatedItems.itemsPerPage"
                :current-page="paginatedItems.currentPage"
                @page-change="onPageChange"
                aria-next-label="Next page"
                aria-previous-label="Previous page"
                aria-page-label="Page"
                aria-current-label="Current page">
            <b-table-column label="Title" v-slot="props">
                {{ props.row.title }}
            </b-table-column>

            <b-table-column label="Display on website" v-slot="props">
                <em v-if="!props.row.active">No</em>
                <span v-else>{{ props.row.startDate ? new Date(props.row.startDate).toDateString() : '?'}} - {{ props.row.endDate ? new Date(props.row.endDate).toDateString() : '?'}}</span>
            </b-table-column>

            <b-table-column v-slot="props">
                <slot name="actions" v-bind:row="props.row"></slot>
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
