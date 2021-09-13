<template>
    <div class="box container">
        <LoginLogo />
        <div class="login-title">
            <h1 class="subtitle has-text-centered">Reset Your Password</h1>
        </div>

        <div class="content">
            <p>Enter a new, secure password to use for this account.<br />It is recommended you use a password manager to keep your passwords unique and random.</p>
        </div>

<!--            <input type="hidden" name="token" value="{{ app('request')->get('token') }}">-->

<!--            <input type="hidden" name="email" value="{{ app('request')->get('email') }}">-->

        <b-field label="New Password" label-position="inside">
            <b-input name="password" type="password"></b-input>
        </b-field>

        <b-field label="New Password Again" label-position="inside">
            <b-input name="password_confirmation" type="password"></b-input>
        </b-field>

        <div class="login-justify-content">
            <b-button type="is-primary">Reset</b-button>
            <router-link to="/auth/login">
                Back to Login
            </router-link>
        </div>

    </div>
</template>

<script>
import LoginLogo from "./LoginLogo.vue";
export default {
    name: "PasswordReset",
    components: {LoginLogo}
}
</script>

<style scoped>

</style>
