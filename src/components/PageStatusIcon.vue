<template>
    <b-icon :icon="statusIcon"></b-icon>
</template>

<script>
import PagesApi from "../PagesApi.js";

export default {
    name: "PageStatusIcon",
    props: {
        item: Object
    },
    computed: {
        statusIcon() {
            if(this.item.stage === PagesApi.STAGE_ARCHIVED) {
                return 'archive';
            } else if(this.item.stage === PagesApi.STAGE_DRAFT) {
                return 'pen-square';
            } else if(this.item.stage === PagesApi.STAGE_PENDING_REVIEW) {
                return 'user-edit';
            } else if(this.item.stage === PagesApi.STAGE_PUBLISHED) {
                return 'globe-asia';
            } else {
                throw new Error('unknown stage ' + this.item.stage);
            }
        }
    }
}
</script>

<style scoped>

</style>