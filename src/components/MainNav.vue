<template>
    <div>
        <b-navbar>
            <template slot="brand">
                <b-navbar-item tag="router-link" to="/dashboard">
                    <img :src="logoSrc" alt="Oxygen CMS" />
                </b-navbar-item>
            </template>
            <template slot="start">
                <b-navbar-item v-for="item in items" :key="item.permissionKey" v-if="can(item.permissionKey)"
                               :href="item.href ? item.href : null" :tag="item.tag ? item.tag : 'a'" :to="item.to ? item.to : null">
                    <b-icon
                        :icon="item.icon"
                        size="is-small" class="push-right">
                    </b-icon>
                    <span>{{ item.name }}</span>
                </b-navbar-item>
            </template>

            <template slot="end">
                <b-navbar-dropdown :label="userName" class="rhs-dropdown">
                    <b-navbar-item href="/oxygen/auth/profile">
                        Profile
                    </b-navbar-item>
                    <b-navbar-item href="/oxygen/auth/preferences">
                        Preferences
                    </b-navbar-item>
                    <b-navbar-item v-if="can('auth.getAuthenticationLogEntries')"  tag="router-link" to="/auth/login-log">
                        Login Log
                    </b-navbar-item>
                    <b-navbar-item @click="signOut">
                        Sign out...
                    </b-navbar-item>
                </b-navbar-dropdown>
            </template>
        </b-navbar>
    </div>
</template>

<script>
    import AuthApi from '../AuthApi';
    import UserPermissions from '../UserPermissions';

    export default {
        props: {
            items: Array
        },
        data() {
            return {}
        },
        computed: {
            userName() {
                return window.OXYGEN_USER_NAME;
            },
            logoSrc() {
                return window.OXYGEN_VENDOR_LOGO_SRC;
            }
        },
        methods: {
            can(key) {
                return UserPermissions.has(key);
            },
            signOut() {
                console.log('user requested logout');
                AuthApi.logout((_) => {
                });
            }
        }
    }
</script>

<style scoped>
    .push-right {
        margin-right: 10px;
    }

    .rhs-dropdown {
        margin-right: 1rem;
    }

    >>> .menu .menu-list a {
        display: flex;
        align-items: center;
    }

    >>> .menu .menu-list a .icon {
        margin-right: 10px;
    }
</style>

<style>



</style>