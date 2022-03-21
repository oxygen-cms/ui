<template>
    <article>
        <p class="title">Pages<b-icon icon="file-alt" size="is-medium"></b-icon></p>
        <p class="subtitle">Manage the content of the website</p>
        <div class="buttons">
            <b-button tag="router-link" to="/pages" icon-left="list">Manage Pages</b-button>
            <b-button tag="router-link" to="/partials" icon-left="puzzle-piece">Manage Partials</b-button>
        </div>
        <b-button tag="a" href="/" icon-left="eye" type="is-primary" rounded>View Live Site</b-button>
    </article>
</template>

<script>
export default {
    name: "PagesPartialsPanel",
    computed: {
        userPermissions() { return this.$store.getters.userPermissions; },
    }
}
</script>

<style scoped lang="scss">
    @import './panel.scss';
</style>