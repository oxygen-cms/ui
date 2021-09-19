<template>
    <div class="box container">
        <h1 class="subtitle has-text-centered">
            You've been logged out
        </h1>

        <div class="login-justify-content">
            <b-button tag="a" href="/" type="is-text">
                Return to Home
            </b-button>
            <b-button to="/auth/login" tag="router-link" type="is-primary">
                Login Again
            </b-button>
        </div>
    </div>
</template>

<script>
export default {
    name: "Logout"
}
</script>

<style scoped>

</style>
