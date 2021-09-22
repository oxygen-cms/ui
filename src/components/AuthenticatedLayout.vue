<template>
    <div class="is-flex is-flex-direction-row" style="height: 100%;">
        <div :class="'left-navigation-container' + (collapsed ? ' is-collapsed' : '')">

            <div class="app-logo-title">
                <router-link to="/" class="app-logo-title-link">
                    <img src="../../assets/oxygen-icon.png" alt="Oxygen CMS" class="app-logo">
                    <router-link v-if="!collapsed" to="/" class="app-title">Oxygen CMS</router-link>
                </router-link>
                <span class="is-flex-grow-1"></span>
                <b-button v-if="!requestedCollapsed" type="is-light" :icon-left="collapsed ? 'angle-right' : 'angle-left'" class="collapse-menu-button" @click="setCollapsed = !setCollapsed"></b-button>
            </div>

            <b-menu class="left-navigation">
                <slot name="main-navigation" :collapsed="collapsed"></slot>
            </b-menu>

            <div :class="'user-info' + (impersonating ? ' has-background-warning' : '')">
                <b-dropdown aria-role="list" :position="collapsed ? 'is-top-right' : 'is-top-left'" expanded>
                    <template #trigger>
                        <div class="user-dropdown">
                            <div v-if="!collapsed" class="user-dropdown-text">
                                <strong v-if="impersonating">Temporarily logged-in as<br/></strong>
                                <transition name="fade" mode="out-in">
                                    <span v-if="user">{{ user.fullName }}</span>
                                    <b-skeleton v-else size="is-medium" width="10em" :animated="true"></b-skeleton>
                                </transition>
                                <transition name="fade" mode="out-in">
                                    <p v-if="user" class="is-size-7">{{ user.email }}</p>
                                    <b-skeleton v-else width="8em" :animated="true"></b-skeleton>
                                </transition>
                            </div>
                            <div class="is-flex-grow-1"></div>
                            <div class="has-background-grey-light centered-icon" style="display: inline-block;">
                                <b-icon icon="user" size="is-large" class="has-text-grey-lighter"></b-icon>
                            </div>
                        </div>
                    </template>
                    <b-dropdown-item aria-role="listitem" has-link><router-link to="/user/profile"><b-icon icon="user-edit"></b-icon>Profile</router-link></b-dropdown-item>
                    <b-dropdown-item aria-role="listitem" has-link><router-link to="/user/login-log"><b-icon icon="lock"></b-icon>Account Security</router-link></b-dropdown-item>
                    <b-dropdown-item separator></b-dropdown-item>
                    <b-dropdown-item aria-role="listitem" @click="$emit('logout')"><b-icon icon="sign-out-alt"></b-icon>Sign Out</b-dropdown-item>
                    <b-dropdown-item v-if="impersonating" aria-role="listitem" @click="stopImpersonating"><b-icon icon="times"></b-icon>Stop impersonating</b-dropdown-item>
                </b-dropdown>
            </div>
        </div>

        <div class="no-pad full-height-container content-column">

            <transition name="slide-up" mode="out-in">
                <router-view></router-view>
            </transition>

        </div>
    </div>
</template>

<script>
import UsersApi from "../UsersApi";
import {morphToNotification} from "../api";
import {isNavigationFailure, NavigationFailureType} from "vue-router/src/util/errors";

export default {
    name: "AuthenticatedLayout",
    emits: ["logout"],
    data() {
        return {
            usersApi: new UsersApi(this.$buefy),
            setCollapsed: false,
            requestedCollapsed: false
        }
    },
    computed: {
        impersonating() { return this.$store.state.impersonating; },
        user() { return this.$store.state.user; },
        userPreferences() { return this.$store.getters.userPreferences; },
        collapsed() {
            return this.setCollapsed || this.requestedCollapsed;
        }
    },
    mounted() {
        console.log('mounted', this.$store);
        this.setGlobalFontSize()
    },
    methods: {
        setGlobalFontSize() {
            let fontSize = this.userPreferences.get('fontSize', '100%');
            console.log('Setting global font size to ', fontSize);
            if(fontSize !== '100%') {
                window.document.documentElement.style.fontSize = fontSize;
            }
        },
        async stopImpersonating() {
            let response = await this.usersApi.stopImpersonating();
            this.$buefy.notification.open(morphToNotification(response));
            this.$store.commit('stopImpersonating', response.user);
            // ignore duplicated navigation failure
            await this.$router.push({ path: '/' }).catch(failure => {
                if(!isNavigationFailure(failure, NavigationFailureType.duplicated)) {
                    throw failure;
                }
            });
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
        transition: max-width 0.5s ease;
    }

    .left-navigation-container.is-collapsed {
        max-width: 5rem;
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

    .app-logo-title-link {
        display: flex;
        align-items: center;
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
        overflow-x: hidden;
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
        margin: 0;
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

    .app-logo-title:hover .collapse-menu-button {
        opacity: 1.0;
    }

    .collapse-menu-button {
        opacity: 0;
        transition: opacity 0.2s ease;
        margin-right: 1rem;
        z-index: 10;
    }

    .is-collapsed {
        .collapse-menu-button {
            margin-left: 1rem;
        }

        .left-navigation {
            padding: 0;
            text-align: center;
        }

        ::v-deep .menu-label {
            text-indent: -9999px;
            height: 0;
            border-bottom: 1px solid $grey-lighter;
        }

        ::v-deep .icon-text > span:not(.icon) {
            display: none;
        }

        ::v-deep .menu-list .icon {
            margin-right: 0;
        }

        ::v-deep .menu-list li ul {
            border-left: 0;
            margin: 0;
            padding-left: 0;
        }

        .app-logo-title-link {
            width: 5rem;
            flex-direction: column;
        }

        .app-logo-title {
            display: block;
            position: relative;
        }

        .collapse-menu-button {
            position: absolute;
            top: 1rem;
            left: 4.5rem;
        }
    }
</style>
