<template>
    <!--    {{ Preferencesimport Vuex from 'vuex';::get('appearance.auth::theme', 'autumn') }}-->
    <div class="login-fullscreen login-theme-autumn">
        <transition name="slide-left" mode="out-in">
            <router-view></router-view>
        </transition>
    </div>
</template>

<script>
export default {
    name: "WelcomeFloat"
}
</script>

<style scoped>

    .login-fullscreen {
        height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        background-attachment: fixed;
        background-size: cover;
        overflow-y: auto;
    }

    .login-theme-autumn {
        background-image: url('/vendor/oxygen/ui-theme/img/bg/autumn-min.jpg');
    }

    .login-theme-city {
        background-image: url('/vendor/oxygen/ui-theme/img/bg/city-min.jpg');
    }

    .login-theme-clouds {
        background-image: url('/vendor/oxygen/ui-theme/img/bg/clouds-min.jpg');
    }

    .login-theme-coast {
        background-image: url('/vendor/oxygen/ui-theme/img/bg/coast-min.jpg');
    }

    .login-theme-speckles {
        background-image: url('/vendor/oxygen/ui-theme/img/bg/speckles-min.jpg');
    }

    .login-theme-trees {
        background-image: url('/vendor/oxygen/ui-theme/img/bg/trees-min.jpg');
    }

    .login-theme-waves {
        background-image: url('/vendor/oxygen/ui-theme/img/bg/waves.jpg');
    }

    .login-theme-yosemite {
        background-image: url('/vendor/oxygen/ui-theme/img/bg/yosemite-falls-min.jpg');
    }

</style>
