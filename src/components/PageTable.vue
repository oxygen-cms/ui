<template>
    <b-table
        ref="table"
        :data="pagesByParent[0].items"
        :loading="pagesByParent[0].loading"
        custom-row-key="id"
        :paginated="pagesByParent[0].totalItems > pagesByParent[0].itemsPerPage"
        backend-pagination
        :total="pagesByParent[0].totalItems"
        :per-page="pagesByParent[0].itemsPerPage"
        :current-page="pagesByParent[0].currentPage"
        detailed
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
        <b-table-column v-slot="props" label="URL"  :sortable="!!onSort" field="slugPart"><a :href="PagesApi.slugToUrl(props.row.slug)" class="is-size-7" target="_blank" v-if="props.row.stage === PagesApi.STAGE_PUBLISHED">{{ PagesApi.slugToUrl(props.row.slug) }} <b-icon icon="external-link-alt"></b-icon></a><em v-else class="is-size-7">(unpublished)</em></b-table-column>
        <b-table-column v-slot="props" label="Description" width="30%" :sortable="!!onSort" field="description"><div class="is-size-7">{{ props.row.description }}</div></b-table-column>
        <b-table-column v-slot="props" label="Last Updated" field="updatedAt" :sortable="!!onSort">
            <div v-if="props.row.updatedAt" class="is-size-7"><Updated :model="props.row"></Updated></div>
        </b-table-column>
        <b-table-column v-slot="props" class="toolbar">
            <slot name="actions" :row="props.row"></slot>
        </b-table-column>
        <!-- TODO: this is a massive hack, only supports up to a certain level of nesting -->
        <template #detail="slot">
            <template v-if="expanded[slot.row.id]">
                <template v-for="(item1, i) in pagesByParent[slot.row.id].items">
                    <PageNestedRow :key="item1.id" :item="item1" :is-first="i  === 0" :depth="1" :expanded="expanded[item1.id]" @toggle-expand="item => setExpanded(item, !expanded[item.id])">
                        <template #actions="props"><slot name="actions" :row="props.row"></slot></template>
                    </PageNestedRow>
                    <template v-if="expanded[item1.id]">
                        <template v-for="(item2, j) in pagesByParent[item1.id].items">
                            <PageNestedRow :key="item2.id" :item="item2" :is-first="j === 0" :depth="2" :expanded="expanded[item2.id]" @toggle-expand="item => setExpanded(item, !expanded[item.id])">
                                <template #actions="props"><slot name="actions" :row="props.row"></slot></template>
                            </PageNestedRow>
                            <template v-if="expanded[item2.id]">
                            <template v-for="(item3, k) in pagesByParent[item2.id].items">
                                <PageNestedRow :key="item3.id" :item="item3" :is-first="k === 0" :depth="3" :expanded="expanded[item3.id]" @toggle-expand="item => setExpanded(item, !expanded[item.id])">
                                    <template #actions="props"><slot name="actions" :row="props.row"></slot></template>
                                </PageNestedRow>
                            </template></template>
                            <PageNestedPagination v-if="expanded[item2.id]" :key="item2.key" :item="item2" :pages-by-parent="pagesByParent" :depth="3" :paginate="paginate"></PageNestedPagination>
                        </template>
                    </template>
                    <PageNestedPagination v-if="expanded[item1.id]" :key="item1.key" :item="item1" :pages-by-parent="pagesByParent" :depth="2" :paginate="paginate"></PageNestedPagination>
                </template>
                <PageNestedPagination :item="slot.row" :pages-by-parent="pagesByParent" :depth="1" :paginate="paginate"></PageNestedPagination>
            </template>
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

export default {
    name: "PageTable",
    components: {PageNestedPagination, PageNestedRow, PageStatusIcon, Updated},
    props: {
        sortField: String,
        sortOrder: String,
        onSort: { type: Function, default: () => {} },
        paginatedItems: { type: Object },
        onPageChange: Function,
    },
    data() {
        return {
            pagesApi: new PagesApi(),
            PagesApi: PagesApi,
            expanded: {},
            // `0` denotes the "root" level
            pagesByParent: {0: {items: [], loading: true, totalItems: 0, itemsPerPage: 0, currentPage: 1}},
        }
    },
    watch: {
        'paginatedItems.items': 'loadAllDetails'
    },
    beforeMount() {
        this.loadAllDetails();
    },
    methods: {
        async loadAllDetails() {
            this.pagesByParent[0].loading = true;
            this.pagesByParent[0].items = await Promise.all(this.paginatedItems.items.map(this.loadChildren));
            this.pagesByParent[0].totalItems = this.paginatedItems.totalItems;
            this.pagesByParent[0].itemsPerPage = this.paginatedItems.itemsPerPage;
            this.pagesByParent[0].currentPage = this.paginatedItems.currentPage;
            this.pagesByParent[0].loading = false;
        },
        rowHasChildren(row) {
            return row.slug !== '/' && row.numChildren > 0;
        },
        async loadChildren(page) {
            return await this.paginate(page, 1);
        },
        async paginate(page, pageNum) {
            if (!this.pagesByParent[page.id]) {
                Vue.set(this.pagesByParent, page.id, {items: [], itemsPerPage: 1, totalItems: 0, currentPage: pageNum});
            }

            // if the slug is the root ( "/" ) then we don't show any child pages, since they're displayed as sibling pages.
            if (page.slug !== '/' && page.numChildren > 0) {
                console.log('loading children for', page.slug, 'page #', pageNum);
                let result = await this.pagesApi.list({ inTrash: false, page: pageNum, q: null, path: page.slug, sortField: this.sortField, sortOrder: this.sortOrder });
                // TODO: this currently recursively grabs all children ==> as many as N http requests where N is the number of pages in the site.
                // Can we be more efficient?
                this.pagesByParent[page.id].items = await Promise.all(result.items.map(this.loadChildren));
                this.pagesByParent[page.id].itemsPerPage = result.itemsPerPage;
                this.pagesByParent[page.id].totalItems = result.totalItems;
                this.pagesByParent[page.id].currentPage = pageNum;
            } else {
                this.pagesByParent[page.id].items = [];
                this.pagesByParent[page.id].itemsPerPage = 0;
                this.pagesByParent[page.id].totalItems = 0;
                this.pagesByParent[page.id].currentPage = 1;
            }

            return page;
        },
        async setExpanded(item, expanded) {
            let o = {};
            o[item.id] = expanded;
            this.expanded = Object.assign({}, this.expanded, o);
        }
    }
}
</script>

<style scoped lang="scss">
    @import "./util.css";

    ::v-deep .table-wrapper.has-sticky-header {
        flex: 1 1 auto;
    }

    @import "../styles/pages-table";
</style>