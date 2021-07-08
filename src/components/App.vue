<template>
    <div class="full-height-container app-container" style="height: 100%;">
        <div class="left-navigation-container">

            <router-link class="app-logo-title" to="/">
                <img src="../../assets/oxygen-icon.png" alt="Oxygen CMS" class="app-logo">
                <span class="app-title">Oxygen CMS</span>
            </router-link>

            <b-menu class="left-navigation">

                <slot name="main-navigation" v-bind:userPermissions="userPermissions"></slot>

            </b-menu>

            <div :class="'user-info' + (impersonating ? ' has-background-warning' : '')">
                <b-dropdown aria-role="list" position="is-top-left" expanded>
                    <template #trigger>
                        <div class="user-dropdown">
                            <div class="user-dropdown-text">
                                <strong v-if="impersonating">Temporarily logged-in as<br/></strong>
                                <transition name="fade" mode="out-in">
                                    <span v-if="user">{{ user.fullName }}</span>
                                    <b-skeleton size="is-medium" width="10em" :animated="true" v-else></b-skeleton>
                                </transition>
                                <transition name="fade" mode="out-in">
                                    <p v-if="user" class="is-size-7">{{ user.email }}</p>
                                    <b-skeleton width="8em" :animated="true" v-else></b-skeleton>
                                </transition>
                            </div>
                            <div class="is-flex-grow-1"></div>
                            <div class="has-background-grey-light centered-icon" style="display: inline-block;">
                                <b-icon icon="user" size="is-large" class="has-text-grey-lighter"></b-icon>
                            </div>
                        </div>
                    </template>
                    <b-dropdown-item aria-role="listitem" has-link><router-link to="/auth/profile"><b-icon icon="user"></b-icon>Profile</router-link></b-dropdown-item>
                    <b-dropdown-item aria-role="listitem" has-link><router-link to="/auth/login-log"><b-icon icon="list"></b-icon>Login Log</router-link></b-dropdown-item>
                    <b-dropdown-item separator></b-dropdown-item>
                    <b-dropdown-item aria-role="listitem" @click="signOut"><b-icon icon="sign-out-alt"></b-icon>Sign Out</b-dropdown-item>
                    <b-dropdown-item v-if="impersonating" aria-role="listitem" @click="stopImpersonating"><b-icon icon="times"></b-icon>Stop impersonating</b-dropdown-item>
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
            defaultRouteTitle: String,
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
            },
            signOut() {
                console.log('user requested logout');
                this.authApi.logout();
            },
            stopImpersonating() {
                this.authApi.stopImpersonating();
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
        border-right: 1px solid $grey-lighter;
    }

    .app-logo-title {
        display: flex;
        align-items: center;
        padding: 1rem 0;
    }

    .app-logo {
        width: 3rem;
        margin-left: 1rem;
        margin-right: 1rem;
    }

    .app-title {
        color: $text;
        font-size: 1.1rem;
    }

    .app-container {
        display: flex;
        flex-direction: row;
    }

    .left-navigation {
        flex: 1;
        padding: 1rem 1rem 1rem 2rem;
        overflow-y: auto;
        // background-color: $grey-dark;
    }

    .content-column {
        flex: 4;
    }

    ::v-deep .router-link-exact-active {
        // background-color: $link-invert !important;
        color: $black-bis !important;
        font-weight: 700;
    }

    ::v-deep .menu-list .icon {
        margin-right: 1rem;
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

    .dropdown-content .icon {
        margin-right: 0.5rem;
    }
</style>

<style lang="scss">
    @import '../styles/app.scss';
</style>
