<template>
    <tr :class="'row-depth-' + depth + (isFirst ? ' first-child' : '')">
        <td>
            <a v-if="item.numChildren > 0" role="button" class="expand-button" @click="event => $emit('toggle-expand', item)">
                <b-icon :icon="expanded ? 'angle-down' : 'angle-right'"></b-icon>
            </a>
        </td>
        <td>{{ item.title }} <PageStatusIcon :item="item"></PageStatusIcon></td>
        <td><a :href="PagesApi.slugToUrl(item.slug)" class="is-size-7" target="_blank">{{ PagesApi.slugToUrl(item.slug) }} <b-icon icon="external-link-alt"></b-icon></a></td>
        <td><div class="is-size-7">{{ item.description }}</div></td>
        <td>
            <div v-if="item" class="is-size-7"><Updated :model="item"></Updated></div>
        </td>
        <td><slot name="actions" :row="item"></slot></td>
    </tr>
</template>

<script>
import PageStatusIcon from "./PageStatusIcon.vue";
import Updated from "./Updated.vue";
import PagesApi from "../PagesApi.js";

export default {
    name: "PageNestedRow",
    components: {PageStatusIcon, Updated},
    props: {
        item: Object,
        isFirst: Boolean,
        depth: Number,
        expanded: Boolean
    },
    data() {
        return {
            PagesApi: PagesApi
        }
    }
}
</script>

<style scoped lang="scss">
    @import "../styles/pages-table.scss";

    //.has-darker-top-border {
    ////border-top-color: $grey-dark;
    ////border-top-width: 1px;
    //    box-shadow: 0 10px 10px -10px inset $grey-dark;
    //}

    .expand-button:hover {
        color: $primary !important;
    }
</style>