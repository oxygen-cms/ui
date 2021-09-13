<template>
    <div class="hero is-fullheight has-background-white-ter">
        <div class="hero-body has-text-centered is-justify-content-center">
            <div>
                <h1 class="title">Page Not Found</h1>
                <p>Perhaps you have mistyped the URL or clicked on a dead link?</p>
                <br />
                <b-button tag="router-link" to="/" type="is-primary">Back to Dashboard</b-button>
            </div>
        </div>


    </div>
</template>

<script>
    import LoginLogo from "./auth/LoginLogo.vue";
    export default {
        name: "Error404",
        components: {LoginLogo}
    }
</script>

<style scoped>

</style>
