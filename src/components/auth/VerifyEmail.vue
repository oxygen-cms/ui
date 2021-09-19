<template>
    <div class="box container">
        <LoginLogo />

          <h1 class="subtitle has-text-centered">
            You need to verify your email address to continue
          </h1>

          <transition name="fade">
            <div v-if="sent" class="content">
              <p>An email has been sent to your inbox with a confirmation link. You need to open the link to continue.</p>
              <p>If you don't receive the email in the next few minutes, we can try and send it again.</p>
              <b-button type="is-link" @click="send">Retry</b-button>
            </div>
            <div v-else-if="sendFailure" class="content">
              <p>The email failed to send.</p>
              <b-button type="is-link" @click="send">Retry</b-button>
            </div>
            <div v-else class="content has-text-centered">
              <p>Sending verification email...</p>
              <b-progress ></b-progress>
            </div>
          </transition>
    </div>
</template>

<script>
import LoginLogo from './LoginLogo.vue';
import AuthApi from "../../AuthApi";

export default {
  name: "VerifyEmail",
  components: { LoginLogo },
  data() {
    return {
      authApi: new AuthApi(this.$buefy),
      sent: false,
      sendFailure: false
    }
  },
  async created() {
    await this.send()
  },
  methods: {
    async send() {
      this.sent = false;
      try {
        await this.authApi.sendEmailVerification();
        this.sent = true;
      } catch(e) {
        if(e.response && e.response.code === 'already_verified') {
          this.$buefy.notification.open({
            message: 'Email address already verified',
            type: 'is-info',
            queue: false,
            duration: 4000
          });
          await this.$router.push({path: '/'});
        } else {
          this.sendFailure = true;
          throw e;
        }
      }
    }
  }
}
</script>

<style scoped>
    @import './login.scss';
</style>