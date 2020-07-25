<template>
    <div class="app-container">
        <MainNav />
        <div class="transition-container">
        <transition name="slide-left">
            <router-view></router-view>
        </transition>
        </div>
    </div>
</template>

<script>
    import MainNav from './MainNav.vue';
    export default {
        name: "App",
        components: { MainNav }
    }
</script>

<style scoped>
    .app-container {
        display: flex;
        flex-direction: column;
        height: 100%;
    }
</style>

<style lang="scss">

    @import './app.scss';

</style>