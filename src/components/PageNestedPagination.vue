<template>
    <tr v-if="pagesByParent[item.id] && pagesByParent[item.id].totalItems > pagesByParent[item.id].itemsPerPage" :class="'row-depth-' + depth">
        <td></td>
        <td colspan="5">
            <div class="is-flex">
                <div class="is-flex-grow-1"></div>
                <b-pagination :total="pagesByParent[item.id].totalItems" :current="pagesByParent[item.id].currentPage" :per-page="pagesByParent[item.id].itemsPerPage" @change="p => paginate(item, p)"></b-pagination>
            </div>
        </td>
    </tr>
</template>

<script>
export default {
    name: "PageNestedPagination",
    props: {
        item: Object,
        pagesByParent: Object,
        depth: Number,
        paginate: Function
    }
}
</script>

<style scoped>

</style>