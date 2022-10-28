<template>
    <span>
        {{ Internationalize.formatLastUpdated(model.updatedAt) }}<span v-if="model.updatedBy">, by <router-link :to="'/users/' + model.updatedBy.id">{{ model.updatedBy.fullName }}</router-link></span>
    </span>
</template>

<script>
import Internationalize from "../Internationalize";

export default {
    name: "Created",
    props: {
        model: { type: Object, required: true }
    },
    data() {
        return {
            Internationalize
        }
    },
}
</script>

<style scoped>

</style>