<template>
    <!--    {{ Preferencesimport Vuex from 'vuex';::get('appearance.auth::theme', 'autumn') }}-->
    <div class="login-fullscreen">
        <b-loading :active="theme === null"></b-loading>
        <transition name="fade">
            <div v-if="theme !== null" :class="'login-background login-theme-' + theme">
                <transition name="slide-left" mode="out-in">
                    <router-view></router-view>
                </transition>
            </div>
        </transition>


    </div>
</template>

<script>
import AuthApi from "../../AuthApi";

export default {
    name: "WelcomeFloat",
    data() {
        return {
            theme: null,
            authApi: new AuthApi(this.$buefy)
        }
    },
    async created() {
        let preferences = await this.authApi.getLoginPreferences();
        this.theme = preferences.theme;
    }
}
</script>

<style scoped>
    .login-fullscreen {
        height: 100%;
        overflow: auto;
    }

    .login-background {
        min-height: 100%;
        background-attachment: fixed;
        background-size: cover;
        display: flex;
        flex-direction: column;
        justify-content: center;
        overflow-y: auto;
    }

    .login-theme-autumn {
        background-image: url('../../../assets/bg/autumn-min.jpg');
    }

    .login-theme-city {
        background-image: url('../../../assets/bg/city-min.jpg');
    }

    .login-theme-clouds {
        background-image: url('../../../assets/bg/clouds-min.jpg');
    }

    .login-theme-coast {
        background-image: url('../../../assets/bg/coast-min.jpg');
    }

    .login-theme-speckles {
        background-image: url('../../../assets/bg/speckles-min.jpg');
    }

    .login-theme-trees {
        background-image: url('../../../assets/bg/trees-min.jpg');
    }

    .login-theme-waves {
        background-image: url('../../../assets/bg/waves.jpg');
    }

    .login-theme-yosemite {
        background-image: url('../../../assets/bg/yosemite-falls-min.jpg');
    }

    .login-theme-white {
        background-color: white;
    }

</style>
