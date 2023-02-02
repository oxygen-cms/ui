<template>
    <b-table
        ref="table"
        :data="paginatedItems === null || paginatedItems.items === null ? [] : paginatedItems.items"
        :loading="paginatedItems === null || paginatedItems.items === null || paginatedItems.loading"
        custom-row-key="id"
        :paginated="paginatedItems !== null && (paginatedItems.totalItems > paginatedItems.itemsPerPage)"
        backend-pagination
        :total="paginatedItems !== null ? paginatedItems.totalItems : 0"
        :per-page="paginatedItems !== null ? paginatedItems.itemsPerPage : 0"
        :current-page="paginatedItems !== null ? paginatedItems.currentPage : 1"
        :detailed="detailed"
        :has-detailed-visible="rowHasChildren"
        custom-detail-row
        :backend-sorting="!!onSort"
        default-sort-direction="asc"
        :default-sort="[sortField, sortOrder]"
        sticky-header
        detail-key="id"
        aria-next-label="Next page"
        aria-previous-label="Previous page"
        aria-page-label="Page"
        aria-current-label="Current page"
        class="full-height-flex full-height-container"
        @page-change="onPageChange"
        @details-open="item => setExpanded(item, true)"
        @details-close="item => setExpanded(item, false)"
        @sort="onSort">
        <b-table-column v-slot="props" label="Title" :sortable="!!onSort" field="title">{{ props.row.title }} <PageStatusIcon :item="props.row"></PageStatusIcon></b-table-column>
        <b-table-column v-slot="props" label="URL"  :sortable="!!onSort" field="slugPart"><a :href="PagesApi.slugToUrl(props.row.slug)" class="is-size-7" target="_blank">{{ PagesApi.slugToUrl(props.row.slug) }} <b-icon icon="external-link-alt"></b-icon></a></b-table-column>
        <b-table-column v-slot="props" label="Description" width="30%" :sortable="!!onSort" field="description"><div class="is-size-7">{{ props.row.description }}</div></b-table-column>
        <b-table-column v-slot="props" label="Last Updated" field="updatedAt" :sortable="!!onSort">
            <div v-if="props.row.updatedAt" class="is-size-7"><Updated :model="props.row"></Updated></div>
        </b-table-column>
        <b-table-column v-slot="props" class="toolbar">
            <slot name="actions" :row="props.row"></slot>
        </b-table-column>
        <!-- TODO: this is a massive hack, only supports up to a certain level of nesting -->
        <template #detail="slot">
            <template v-for="(item1, i) in (pagesByParent[slot.row.id] ? pagesByParent[slot.row.id].items : [])">
                <PageNestedRow :item="item1" :is-first="i  === 0" :depth="1" :has-children="rowHasChildren(item1)" @toggle-expand="item => setExpanded(item, !item.expanded)">
                    <template #actions="props"><slot name="actions" :row="props.row"></slot></template>
                </PageNestedRow>
                <template v-for="(item2, j) in (pagesByParent[item1.id] ? pagesByParent[item1.id].items : [])" v-if="item1.expanded">
                    <PageNestedRow :item="item2" :is-first="j === 0" :depth="2" :has-children="rowHasChildren(item2)" @toggle-expand="item => setExpanded(item, !item.expanded)">
                        <template #actions="props"><slot name="actions" :row="props.row"></slot></template>
                    </PageNestedRow>
                    <template v-for="(item3, k) in (pagesByParent[item2.id] ? pagesByParent[item2.id].items : [])" v-if="item2.expanded">
                        <PageNestedRow :item="item3" :is-first="k === 0" :depth="3" :has-children="rowHasChildren(item3)">
                            <template #actions="props"><slot name="actions" :row="props.row"></slot></template>
                        </PageNestedRow>
                    </template>
                    <PageNestedPagination v-if="item2.expanded" :item="item2" :pages-by-parent="pagesByParent" :depth="3" :paginate="paginate"></PageNestedPagination>
                </template>
                <PageNestedPagination :item="item1" v-if="item1.expanded" :pages-by-parent="pagesByParent" :depth="2" :paginate="paginate"></PageNestedPagination>
            </template>
            <PageNestedPagination :item="slot.row" :pages-by-parent="pagesByParent" :depth="1" :paginate="paginate"></PageNestedPagination>
        </template>
    </b-table>
</template>

<script>
import PageStatusIcon from "./PageStatusIcon.vue";
import Updated from "./Updated.vue";
import PagesApi from "../PagesApi.js";
import Vue from "vue";
import PageNestedRow from "./PageNestedRow.vue";
import PageNestedPagination from "./PageNestedPagination.vue";
import {getApiHost} from "../api.js";

export default {
    name: "PageTable",
    props: {
        detailed: Boolean,
        sortField: String,
        sortOrder: String,
        onSort: { type: Function, default: () => {} },
        paginatedItems: { type: Object | null },
        onPageChange: Function,
    },
    components: {PageNestedPagination, PageNestedRow, PageStatusIcon, Updated},
    data() {
        return {
            pagesApi: new PagesApi(),
            PagesApi: PagesApi,
            pagesByParent: {}
        }
    },
    beforeMount() {
        this.loadAllDetails();
    },
    watch: {
        'paginatedItems.items': 'loadAllDetails'
    },
    methods: {
        loadAllDetails() {
            this.paginatedItems.items.forEach(this.loadChildren);
        },
        rowHasChildren(row) {
            return this.pagesByParent[row.id] && this.pagesByParent[row.id].items.length > 0;
        },
        async loadChildren(page) {
            return await this.paginate(page, 1, false);
        },
        async paginate(page, pageNum, forceLoadChildren) {
            if (this.pagesByParent[page.id] && this.pagesByParent[page.id].currentPage === pageNum) {
                console.log('already loaded ' + page.slug + ' page ' + pageNum);
                return;
            }
            if (!this.pagesByParent[page.id]) {
                Vue.set(this.pagesByParent, page.id, {items: [], itemsPerPage: 1, totalItems: 0, currentPage: pageNum});
            }

            // if the slug is the root ( "/" ) then we don't show any child pages, since they're displayed as sibling pages.
            if (page.slug !== '/') {
                let result = await this.pagesApi.list({ inTrash: false, page: pageNum, q: null, path: page.slug, sortField: this.sortField, sortOrder: this.sortOrder });
                this.pagesByParent[page.id].items = result.items.map(child => {
                    return {expanded: false, ...child};
                });
                this.pagesByParent[page.id].itemsPerPage = result.itemsPerPage;
                this.pagesByParent[page.id].totalItems = result.totalItems;
                this.pagesByParent[page.id].currentPage = pageNum;
            }

            // we should reload children because e.g.: we just switched pages...
            if (forceLoadChildren) {
                this.pagesByParent[page.id].items.forEach(this.loadChildren);
            }

            return this.pagesByParent[page.id].items;
        },
        setExpanded(item, expanded) {
            item.expanded = expanded;
            if (item.expanded) {
                this.pagesByParent[item.id].items.forEach(this.loadChildren);
            }
        }
    }
}
</script>

<style scoped lang="scss">
    ::v-deep .table-wrapper.has-sticky-header {
        flex: 1 1 auto;
    }

    @import "../styles/pages-table";
</style>