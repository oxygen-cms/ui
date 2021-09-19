<template>
    <div class="box container">
        <LoginLogo />

        <h1 class="subtitle has-text-centered">
            <span v-if="successfullyReset">Password Reset Successful!</span>
            <span v-else-if="hasRequiredParams">Reset Your Password</span>
            <span v-else>Invalid password reset link</span>
        </h1>

        <div v-if="successfullyReset" class="content">
            <p>
                Your password reset request was successful. You should now be able to login with your new password.
            </p>
            <div class="is-flex is-justify-content-center">
                <b-button tag="router-link" to="/auth/login" type="is-success">Login</b-button>
            </div>
        </div>
        <div v-else-if="hasRequiredParams">
            <div class="content">
                <p>Enter a new, secure password to use for this account.<br />It is recommended you use a password manager to keep your passwords unique and random.</p>
            </div>

            <b-field label="New Password" label-position="inside">
                <b-input v-model="password" type="password"></b-input>
            </b-field>

            <b-field label="New Password Again" label-position="inside"
                     :type="passwordsMatch ? '' : 'is-danger'"
                     :message="passwordsMatch ? '' : 'Passwords do not match'">
                <b-input v-model="passwordConfirmation" type="password" @keyup.native.enter="submit"></b-input>
            </b-field>

            <div class="login-justify-content">
                <b-button type="is-primary" @click="submit" :disabled="!passwordsMatch" :loading="submitting">Reset</b-button>
                <router-link to="/auth/login">
                    Back to Login
                </router-link>
            </div>
        </div>
        <div v-else class="content">
            <p>One or more required parameters were missing from the link. Double-check that you have used the correct password reset link.</p>
        </div>

    </div>
</template>

<script>
import LoginLogo from "./LoginLogo.vue";
import AuthApi from "../../AuthApi";
import {morphToNotification} from "../../api";
export default {
    name: "PasswordReset",
    components: {LoginLogo},
    data() {
        return {
            authApi: new AuthApi(this.$buefy),
            password: '',
            passwordConfirmation: '',
            submitting: false,
            successfullyReset: false
        };
    },
    computed: {
        hasRequiredParams() {
            return this.$route.query.email && this.$route.query.token;
        },
        passwordsMatch() {
            return this.password === this.passwordConfirmation;
        }
    },
    methods: {
        async submit() {
            let req = {
                password: this.password,
                password_confirmation: this.passwordConfirmation,
                email: this.$route.query.email,
                token: this.$route.query.token
            };
            console.log(req);
            this.submitting = true;
            try {
                let data = await this.authApi.resetPassword(req);
                this.$buefy.notification.open(morphToNotification(data));
                this.successfullyReset = true;
            } catch(e) {
            }
            this.submitting = false;
        }
    }
}
</script>

<style scoped>

</style>
