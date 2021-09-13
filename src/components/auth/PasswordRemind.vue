<template>
    <div class="box container">
        <LoginLogo />
        <div class="login-title">
            <h1 class="subtitle has-text-centered">
                <span v-if="success">
                    Password reset link sent!
                </span>
                <span v-else>Forgot Password</span>
            </h1>
        </div>

        <transition name="fade" mode="out-in">
            <div v-if="!success">
                <b-field label="Email Address" label-position="inside">
                    <b-input name="email" type="email" v-model="accountEmail" required @keyup.enter.native="submitForm"></b-input>
                </b-field>

                <div class="login-justify-content">
                    <b-button type="is-primary" @click="submitForm" :loading="submitting">Send Reminder Email</b-button>
                    <router-link to="/auth/login">
                        Back to Login
                    </router-link>
                </div>
            </div>
            <div v-else>
                <p>Please check your email for further instructions on how to complete the process.</p>
            </div>
        </transition>


    </div>
</template>

<script>

import LoginLogo from "./LoginLogo.vue";
import AuthApi from "../../AuthApi";
import {morphToNotification} from "../../api";

export default {
    name: "PasswordRemind.vue",
    components: { LoginLogo },
    data() {
        return {
            authApi: new AuthApi(this.$buefy),
            accountEmail: '',
            success: false,
            submitting: false,
        }
    },
    methods: {
        async submitForm() {
            try {
                this.submitting = true;
                let response = await this.authApi.sendReminderEmail(this.accountEmail);
                this.$buefy.notification.open(morphToNotification(response));
                this.success = true;
            } catch(e) {}
            this.submitting = false;
        }
    }
}
</script>

<style scoped>

</style>
