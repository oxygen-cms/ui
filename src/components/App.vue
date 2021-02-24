<template>
    <div class="full-height-container">
        <MainNav :items="navbarItems">
            <template v-slot:vendor-logo>
                <slot name="navbar-vendor-logo"></slot>
            </template>
        </MainNav>
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
            navbarItems: { type: Array },
            defaultRouteTitle: String
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
    @import 'util.css';
</style>

<style lang="scss">
    @import '../styles/app.scss';
</style>
