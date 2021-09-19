<template>
    <b-button size="is-small" type="is-text" icon-right="pencil-alt" class="show-on-hover" @click="edit" />
</template>

<script>
export default {
    name: "EditButtonOnRowHover",
    props: { edit: { type: Function, required: true }}
}
</script>

<style scoped>
    .show-on-hover {
        opacity: 0;
        transition: opacity 0.2s ease;
    }

    tr:hover .show-on-hover {
        opacity: 1;
    }
</style>