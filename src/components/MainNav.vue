<template>
    <div>
        <b-navbar>
            <template #brand>
                <b-navbar-item tag="router-link" to="/dashboard">
                    <slot name="vendor-logo"></slot>
                </b-navbar-item>
            </template>

            <template #start>
                <b-navbar-item v-for="item in items" :key="item.permissionKey" v-if="can(item.permissionKey)"
                               :href="item.href ? item.href : null" :tag="item.tag ? item.tag : 'a'" :to="item.to ? item.to : null">
                    <b-icon
                        :icon="item.icon"
                        size="is-small" class="push-right">
                    </b-icon>
                    <span>{{ item.name }}</span>
                </b-navbar-item>
            </template>

            <template #end>
                <b-navbar-dropdown class="rhs-dropdown">
                    <template v-slot:label>
                        <transition name="fade-out-in">
                            <span v-if="user" style="min-width: 8em; text-align: right">{{ user.fullName }}</span>
                            <b-skeleton width="8em" v-else></b-skeleton>
                        </transition>
                    </template>
                    <b-navbar-item tag="router-link" to="/auth/profile">
                        Profile
                    </b-navbar-item>
                    <b-navbar-item v-if="can('auth.getAuthenticationLogEntries')" tag="router-link" to="/auth/login-log">
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
        name: 'main-nav',
        props: {
            items: Array,
            allExternalLinks: {
                type: Boolean,
                default: false
            },
            externalLinkPrefix: {
                type: String,
                default: null
            }
        },
        data() {
            return {
                user: null,
                authApi: new AuthApi(this.$buefy)
            }
        },
        created() {
            this.fetchData()
        },
        methods: {
            async fetchData() {
                this.user = (await this.authApi.userDetails()).user;
            },
            async can(key) {
                return await UserPermissions.has(key);
            },
            signOut() {
                console.log('user requested logout');
                this.authApi.logout();
            }
        }
    }
</script>

<style scoped lang="scss">
    @import '../styles/variables.scss';

    .push-right {
        margin-right: 0.7rem;
    }

    .rhs-dropdown {
        margin-right: 1rem;
    }

    .navbar a.router-link-exact-active {
        color: $primary;
    }
</style>
