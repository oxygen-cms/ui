<template>
    <span>
        {{ Internationalize.formatLastUpdated(model.createdAt) }}<span v-if="model.createdBy">, by <router-link :to="'/users/' + model.createdBy.id">{{ model.createdBy.fullName }}</router-link></span>
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