<template>
    <div class="box container">
        <LoginLogo />

        <div v-if="!wantsTotpCode">
            <b-notification has-icon icon="exclamation-triangle" type="is-danger is-light" :active="!submitting && hasFailedLogin" :closable="false" class="incorrect-login">
                Username or password incorrect
            </b-notification>

            <b-field label="Username" label-position="inside" :type="!submitting && hasFailedLogin ? 'is-danger' : ''">
                <b-input name="username" v-model="username" required validation-message="Username is required"></b-input>
            </b-field>

            <b-field label="Password" label-position="inside" :type="!submitting && hasFailedLogin ? 'is-danger' : ''">
                <b-input name="password" v-model="password" type="password" required validation-message="Password is required" @keyup.enter.native="submitLogin"></b-input>
            </b-field>

            <br>

<!--                {{ URL::route(Blueprint::get('Password')->getRouteName('getRemind')) }} -->
            <div class="login-justify-content">
                <b-button type="is-primary" tag="input" value="Login" @click="submitLogin" :loading="submitting"></b-button>
                <router-link to="/auth/forgot-password">Forgot Password</router-link>
            </div>
        </div>

        <div v-else>
            <h2 class="subtitle">Two-factor authentication is required</h2>
            <p>To continue, open up your Authenticator app and issue your 2FA code.</p>

            <br>

            <b-field key="totpCode" label="2FA Code" label-position="inside" :type="!submitting && hasFailedLogin ? 'is-danger' : ''" :message="!submitting && hasFailedLogin ? 'Incorrect code. Try again.' : ''">
                <b-input name="totpCode" v-model="totpCode" type="number" placeholder="e.g.: 123456" minlength="6" required autofocus @keyup.enter.native="submitLogin">
                </b-input>
            </b-field>

            <br>

            <div class="login-justify-content">
                <b-button type="is-primary" @click="submitLogin" :disabled="confirmCodeDisabled" :loading="submitting">Confirm code</b-button>
            </div>
        </div>

    </div>
</template>

<script>
import LoginLogo from "./LoginLogo.vue";
import AuthApi from "../../AuthApi";

export default {
    name: "Login",
    components: { LoginLogo },
    data() {
        return {
            authApi: new AuthApi(this.$buefy),
            username: '',
            password: '',
            wantsTotpCode: false,
            totpCode: '',
            hasFailedLogin: false,
            submitting: false
        }
    },
    computed: {
        confirmCodeDisabled() {
            return this.totpCode.length !== 6;
        }
    },
    created() {
        console.log(this.$store.state.user);
        if(this.$store.state.loginStatus === true) {
            this.$buefy.notification.open({
                message: 'You\'re already logged in!',
                type: 'is-info',
                duration: 4000
            });
            this.$router.push({ path: '/' });
        }
    },
    methods: {
        async submitLogin() {
            try {
                this.submitting = true;
                let response = await this.authApi.login(this.username, this.password, this.totpCode !== '' ? this.totpCode : null);
                this.submitting = false;
                this.hasFailedLogin = false;
                this.$store.commit('setUser', response.user);
                this.$router.push(this.$route.query.redirect ?? { path: '/auth' });
            } catch(e) {
                this.submitting = false;
                if(e.response && e.response.code === 'incorrect_username_password') {
                    this.password = '';
                    this.hasFailedLogin = true;
                } else if(e.response && e.response.code === 'two_factor_auth_failed') {
                    // if we are trying to enter a 2FA code again, then count the previous attempt as "failed"
                    this.hasFailedLogin = this.wantsTotpCode;
                    this.wantsTotpCode = true;
                }
            }
        }
    }
}
</script>

<style scoped>
    @import "./login.scss";

    .incorrect-login ::v-deep .media {
        align-items: center;
    }
</style>
