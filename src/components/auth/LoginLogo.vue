<template>
    <div class="is-flex is-align-items-center is-justify-content-center login-welcome">
        <img src="../../../assets/oxygen-icon.png" alt="Oxygen CMS" class="app-logo">
        <span class="app-title">
            Oxygen CMS
        </span>
    </div>
</template>

<script>
export default {
    name: "LoginLogo"
}
</script>

<style scoped>
    .app-title {
        font-weight: 200;
        font-size: 2.2rem;
    }

    .app-logo {
        margin-right: 0.75rem;
        width: 4rem;
    }

    .login-welcome {
        padding: 1rem 0;
    }
</style>
