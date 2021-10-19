<template>
    <div class="box container">
        <LoginLogo />

        <div v-if="!wantsTotpCode">
            <b-notification has-icon icon="exclamation-triangle" type="is-danger is-light" :active="!submitting && hasFailedLogin" :closable="false" class="incorrect-login">
                Username or password incorrect
            </b-notification>

            <b-field label="Username" label-position="inside" :type="!submitting && hasFailedLogin ? 'is-danger' : ''">
                <b-input ref="username" v-model="username" name="username"></b-input>
            </b-field>

            <b-field label="Password" label-position="inside" :type="!submitting && hasFailedLogin ? 'is-danger' : ''">
                <b-input v-model="password" name="password" type="password" @keyup.enter.native="submitLogin"></b-input>
            </b-field>

            <br>

<!--                {{ URL::route(Blueprint::get('Password')->getRouteName('getRemind')) }} -->
            <div class="login-justify-content">
                <b-button type="is-primary" tag="input" value="Login" :loading="submitting" @click="submitLogin"></b-button>
                <router-link to="/auth/forgot-password">Forgot Password</router-link>
            </div>
        </div>

        <div v-else>
            <h2 class="subtitle">Two-factor authentication is required</h2>
            <p>To continue, open up your Authenticator app and issue your 2FA code.</p>

            <br>

            <b-field key="totpCode" label="2FA Code" label-position="inside" :type="!submitting && hasFailedLogin ? 'is-danger' : ''" :message="!submitting && hasFailedLogin ? 'Incorrect code. Try again.' : ''">
                <b-input ref="totpCode" v-model="totpCode" name="totpCode" type="number" placeholder="e.g.: 123456" minlength="6" required @keyup.enter.native="submitLogin" />
            </b-field>

            <br>

            <div class="login-justify-content">
                <b-button type="is-primary" :disabled="confirmCodeDisabled" :loading="submitting" @click="submitLogin">Confirm code</b-button>
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
    mounted() {
        this.$refs.username.focus();
    },
    methods: {
        async submitLogin() {
            try {
                this.submitting = true;
                let response = await this.authApi.login(this.username, this.password, this.totpCode !== '' ? this.totpCode : null);
                this.submitting = false;
                this.hasFailedLogin = false;
                this.$store.commit('setUser', response.user);
                if(this.$route.query.location) {
                  window.location = this.$route.query.location;
                }
                this.$buefy.notification.open({
                  message: "You're now logged in.",
                  type: 'is-info',
                  queue: false
                });
                await this.$router.push(this.$route.query.redirect ?? { path: '/' });
            } catch(e) {
                this.submitting = false;
                if(e.response && e.response.code === 'account_deactivated') {
                    this.hasFailedLogin = true;
                    this.$buefy.notification.open({
                        message: 'Your account is deactivated. Please contact the site administrator for help on how to regain access to your account.',
                        type: 'is-warning',
                        queue: false,
                        duration: 10000
                    });
                }
                if(e.response && ['incorrect_username_password', 'no_username'].includes(e.response.code)) {
                    this.password = '';
                    this.hasFailedLogin = true;
                } else if(e.response && e.response.code === 'two_factor_auth_failed') {
                    // if we are trying to enter a 2FA code again, then count the previous attempt as "failed"
                    this.hasFailedLogin = this.wantsTotpCode;
                    this.wantsTotpCode = true;
                    this.$nextTick(() => {
                        this.$refs.totpCode.focus();
                    });
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
