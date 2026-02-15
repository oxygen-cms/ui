<template>
    <b-icon :icon="statusIcon"></b-icon>
</template>

<script>
import PartialsApi from "../../PartialsApi.js";

export default {
    name: "PartialStatusIcon",
    props: {
        item: Object
    },
    computed: {
        statusIcon() {
            if(this.item.stage === PartialsApi.STAGE_DRAFT) {
                return 'pen-square';
            } else if(this.item.stage === PartialsApi.STAGE_PUBLISHED) {
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