<template>
    <div class="full-height-container app-container" style="height: 100%;">
        <div class="left-navigation-container">

            <router-link class="vendor-logo" to="/">
                <slot name="navbar-vendor-logo"></slot>
                <h1 class="subtitle has-text-centered has-text-white-ter" style="font-variant: small-caps;">Administration Panel</h1>
            </router-link>

            <b-menu class="left-navigation">

                <slot name="main-navigation" v-bind:userPermissions="userPermissions"></slot>

            </b-menu>

            <div class="user-info has-background-grey-darker">
                <b-dropdown aria-role="list" position="is-top-left" expanded>
                    <template #trigger>
                        <div class="user-dropdown">
                            <div class="user-dropdown-text has-text-light">
                                <transition name="fade-out-in">
                                    <span v-if="user">{{ user.fullName }}</span>
                                    <b-skeleton size="is-medium" width="10em" :animated="true" v-else></b-skeleton>
                                </transition>
                                <transition name="fade-out-in">
                                    <p v-if="user" class="is-size-7">{{ user.email }}</p>
                                    <b-skeleton width="8em" :animated="true" v-else></b-skeleton>
                                </transition>
                            </div>
                            <div class="is-flex-grow-1"></div>
                            <div class="has-background-grey centered-icon" style="display: inline-block;">
                                <b-icon icon="user" size="is-large" class="has-text-grey-lighter"></b-icon>
                            </div>
                        </div>
                    </template>
                    <b-dropdown-item aria-role="listitem" has-link><router-link to="/auth/profile"><b-icon icon="user"></b-icon>Profile</router-link></b-dropdown-item>
                    <b-dropdown-item aria-role="listitem" has-link><router-link to="/preferences/user"><b-icon icon="cogs"></b-icon>Configure user preferences</router-link></b-dropdown-item>
                    <b-dropdown-item aria-role="listitem" has-link><router-link to="/auth/login-log"><b-icon icon="list"></b-icon>Login Log</router-link></b-dropdown-item>
                    <b-dropdown-item separator></b-dropdown-item>
                    <b-dropdown-item aria-role="listitem" @click="signOut"><b-icon icon="sign-out-alt"></b-icon>Sign Out</b-dropdown-item>
                </b-dropdown>
            </div>
        </div>

        <div class="no-pad full-height-container content-column">

            <transition name="slide-left" mode="out-in">
                <router-view></router-view>
            </transition>

        </div>

    </div>
</template>

<script>
    import AuthApi from "../AuthApi";
    import UserPermissions from "../UserPermissions";
    export default {
        name: "App",
        props: {
            appTitle: { type: String },
            defaultRouteTitle: String
        },
        components: { MainNav },
        data() {
            return {
                user: null,
                authApi: new AuthApi(this.$buefy),
                userPermissions: null
            }
        },
        created() {
            this.setTitle(this.$route.meta.title);
            this.$root.$on('update-route-title', (title) => {
                this.setTitle(title);
            });
            this.fetchUserDetails();
        },
        watch: {
            '$route' (to, from) {
                this.setTitle(to.meta.title);
            },
        },
        methods: {
            setTitle(title) {
                document.title = (title || this.defaultRouteTitle) + ' - ' + this.appTitle;
            },
            async fetchUserDetails() {
                this.user = (await this.authApi.userDetails()).user;
                this.userPermissions = new UserPermissions(this.user.permissions);
                console.log('permissions loaded');
            },
            signOut() {
                console.log('user requested logout');
                this.authApi.logout();
            }
        }
    }
</script>

<style scoped lang="scss">
    @import 'util.css';
    @import '../styles/_variables.scss';

    .left-navigation-container {
        padding: 0 !important;
        display: flex;
        flex-direction: column;
        flex: 1;
        max-width: 550px;
        border-right: 1px solid $grey-darker;
    }

    .app-container {
        display: flex;
        flex-direction: row;
    }

    .left-navigation {
        flex: 1;
        padding: 1rem 1rem;
        overflow-y: auto;
        background-color: $grey-dark;
    }

    .content-column {
        flex: 4;
    }

    .is-pulled-right {
        margin-left: auto;
    }

    ::v-deep .router-link-exact-active {
        background-color: $link-invert !important;
        color: $text !important;
    }

    .vendor-logo {
        display: block;
        padding: 1rem;
        background-color: $grey-darker;
        border-bottom: 1px solid $black-ter;
    }

    .vendor-logo ::v-deep img {
        margin: 0 auto;
        display: block;
        max-width: 70%;
    }

    .user-info {
        border-top: 1px solid $black-ter;
    }

    .user-dropdown {
        padding: 1rem;
        cursor: pointer;
        display: flex;
        align-items: center;
    }

    .columns {
        margin-left: 0;
        margin-right: 0;
        margin-top: 0;
        margin-bottom: 0;
    }

    .no-pad {
        padding: 0;
    }

    .content-column {
        background-color: $white-ter;
    }

    .powered-by-oxygen {
        padding: 1rem;
    }
</style>

<style lang="scss">
    @import '../styles/app.scss';
</style>
