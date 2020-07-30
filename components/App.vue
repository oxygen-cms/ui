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
        props: {
            appTitle: { type: String },
            defaultRouteTitle: { type: String }
        },
        components: { MainNav },
        created() {
            this.setTitle(this.$route.meta.title);
            this.$root.$on('update-route-title', (title) => {
                this.setTitle(title);
            });
        },
        watch: {
            '$route' (to, from) {
                this.setTitle(to.meta.title);
            },
        },
        methods: {
            setTitle(title) {
                document.title = (title || this.defaultRouteTitle) + ' - ' + this.appTitle;
            }
        }
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