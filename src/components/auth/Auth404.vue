<template>
    <div class="box container is-flex is-flex-direction-column is-align-items-center">
        <h1 class="title mt-6 mb-6">Page Not Found</h1>
        <b-button tag="router-link" to="/" type="is-success">Back to Home</b-button>
    </div>
</template>

<script>
export default {
    name: "Auth404"
}
</script>

<style scoped>
    @import './login.scss';
</style>
