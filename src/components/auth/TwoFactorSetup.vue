<template>
    <div class="box container is-wider two-factor-setup">
        <LoginLogo />

        <transition name="fade" mode="out-in">
            <div v-if="twoFactorQRCode">
                <h1 class="subtitle has-text-centered">
                    You need to set up two-factor authentication for this account.
                </h1>

                <div class="content">
                <p>Two-factor authentication uses once-off codes from another device (e.g.: your phone) for additional security. To use two-factor authentication with Oxygen CMS, you need to download an authenticator app onto your phone.</p>
                <p>Supported apps include:</p>
                <ul>
                    <li>Google Authenticator</li>
                    <li><a href="https://lastpass.com/auth/" target="_blank">LastPass Authenticator</a></li>
                    <li><a href="https://www.microsoft.com/en-us/account/authenticator" target="_blank">Microsoft Authenticator</a></li>
                    <li><a href="https://authy.com/features/" target="_blank">Authy</a></li>
                </ul>
                </div>

                <h2 class="subtitle">Getting started</h2>
                <p>Scan the QR code below on your phone to begin setting up two-factor authentication, or follow <a :href="twoFactorUri">this link</a>.</p>

                <div class="qr-code">
                    <div v-html="twoFactorQRCode"></div>
                </div>

                <p>Or, manually enter this secret key into your chosen authenticator app:<br><br>
                <pre>{{ twoFactorString }}</pre></p>

                <br>
                <h2 class="subtitle">Confirm a two-factor code to continue</h2>
                <p>Once you've successfully configured your authenticator app, enter a valid code below to continue.</p>
                <br>

                <div class="level">
                    <div class="level-left">
                        <b-field label="2FA Code" label-position="inside" :type="failedValidation ? 'is-danger' : ''">
                            <b-input name="2fa_code" type="number" v-model="totpCode" autofocus minlength="6" required placeholder="enter code here" @keyup.enter.native="confirm2FA"></b-input>
                        </b-field>
                    </div>
                    <div class="level-right">
                        <b-button type="is-primary" @click="confirm2FA" :loading="submitting">Confirm</b-button>
                    </div>
                </div>
            </div>
            <div v-else style="height=20rem;"></div>
        </transition>

        <b-loading :active="!twoFactorQRCode" :is-full-page="false"></b-loading>

    </div>
</template>

<script>
import AuthApi from "../../AuthApi";
import LoginLogo from "./LoginLogo.vue";
import {morphToNotification} from "../../api";

export default {
    name: "TwoFactorSetup",
    components: { LoginLogo },
    data() {
        return {
            twoFactorUri: null,
            twoFactorString: null,
            twoFactorQRCode: null,
            totpCode: '',
            failedValidation: false,
            submitting: false,
            authApi: new AuthApi(this.$buefy)
        }
    },
    async created() {
        try {
            let data = await this.authApi.setupTwoFactorAuth();
            this.twoFactorUri = data.as_uri;
            this.twoFactorString = data.as_string;
            this.twoFactorQRCode = data.as_qr_code;
        } catch(e) {
            console.log('Already set up?');
        }
    },
    methods: {
        async confirm2FA() {
            try {
                this.submitting = true;
                let response = await this.authApi.confirmTwoFactorAuth(this.totpCode);
                this.$buefy.notification.open(morphToNotification(response));
                this.$router.push('/');
            } catch(e) {
                this.failedValidation = true;
            }
            this.submitting = false;
        }
    }
}
</script>

<style scoped lang="scss">
    @import './login.scss';

    .qr-code {
        padding: 1rem 0;
    }

    .qr-code ::v-deep .b-skeleton {
        max-width: 200px;
    }

    .two-factor-setup {
        position: relative;
    }
</style>
