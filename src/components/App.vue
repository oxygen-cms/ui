<template>
    <div style="height: 100%;">
            <router-view @logout="signOut">
                <template #main-navigation>
                    <MainMenu :items="mainMenuItems" />
                </template>
            </router-view>
    </div>
</template>

<script>
    import AuthApi from "../AuthApi";
    import MainMenu from "./MainMenu.vue";
    export default {
        name: "App",
        components: {MainMenu},
        props: {
            appTitle: { type: String, required: true },
            defaultRouteTitle: { type: String, required: true },
            mainMenuItems: { type: Object, required: true },
            impersonating: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                user: null,
                authApi: new AuthApi(this.$buefy),
                userPermissions: null
            }
        },
        watch: {
            '$route' (to) {
                this.setTitle(to.meta.title);
            },
        },
        created() {
            this.setTitle(this.$route.meta.title);
            this.$root.$on('update-route-title', (title) => {
                this.setTitle(title);
            });
        },
        methods: {
            setTitle(title) {
                document.title = (title || this.defaultRouteTitle) + ' - ' + this.appTitle;
            },
            async signOut() {
                await this.authApi.logout();
                this.$store.commit('setUser', null);
                await this.$router.push('/auth/logout');
            },
            stopImpersonating() {
                this.authApi.stopImpersonating();
            }
        }
    }
</script>

<style lang="scss">
    @import '../styles/app.scss';
</style>
