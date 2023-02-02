<template>
    <div>
        <b-button v-if="item.stage !== STAGE_PUBLISHED" rounded size="is-small" icon-left="globe-asia" @click="publish" class="mr-2">Publish</b-button>
    </div>
</template>

<script>
import PagesApi from "../PagesApi.js";

export default {
    name: "PageActions",
    props: {
        item: Object
    },
    data() {
        return {
            STAGE_PUBLISHED: PagesApi.STAGE_PUBLISHED,
            pagesApi: new PagesApi()
        }
    },
    methods: {
        async publish() {
            let item = await this.pagesApi.publish(this.item.id);
            this.$emit('update', item);
        }
    }
}
</script>