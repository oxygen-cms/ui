<template>
    <div>
        <b-button v-if="item.stage !== STAGE_PUBLISHED" class="mr-2" rounded size="is-small" icon-left="globe-asia" @click="publish">Publish</b-button>
    </div>
</template>

<script>
import PartialsApi from "../../PartialsApi.js";

export default {
    name: "PartialActions",
    props: {
        item: Object
    },
    data() {
        return {
            STAGE_PUBLISHED: PartialsApi.STAGE_PUBLISHED,
            partialsApi: new PartialsApi()
        }
    },
    methods: {
        async publish() {
            let item = await this.partialsApi.publish(this.item.id);
            this.$emit('update', item);
        }
    }
}
</script>