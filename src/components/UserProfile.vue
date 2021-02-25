<template>
    <div class="columns">
        <div class="column pad is-one-fifth left-navigation-container">
            <b-menu class="left-navigation">
                <b-menu-list label="User">
                    <b-menu-item label="Profile" tag="router-link" to="/auth/profile"></b-menu-item>
                    <b-menu-item label="View recent logins" tag="router-link" to="/auth/login-log"></b-menu-item>
                </b-menu-list>

                <b-menu-list label="User Preferences">
                    <b-menu-item tag="router-link" to="/preferences/user.general/update" label="Configure font-size"></b-menu-item>
                    <b-menu-item tag="router-link" to="/preferences/user.editor/update" label="Configure editor appearance"></b-menu-item>
                    <b-menu-item tag="router-link" to="/preferences/user.pageLoad/update" label="Configure page loading"></b-menu-item>
                </b-menu-list>

                <b-menu-list label="System Preferences">
                    <b-menu-item tag="router-link" to="/preferences/modules.auth/update" label="Authentication"></b-menu-item>
                    <b-menu-item tag="router-link" to="/preferences/modules.pages/update" label="Page caching"></b-menu-item>
                    <b-menu-item tag="router-link" to="/preferences/modules.people/update" label="Mailgun and trybooking integration"></b-menu-item>
                    <b-menu-item tag="router-link" to="/preferences/appearance.themes/update" label="Themes"></b-menu-item>
                    <b-menu-item tag="router-link" to="/preferences/appearance.auth/update" label="Login look & feel"></b-menu-item>
                    <b-menu-item tag="router-link" to="/preferences/appearance.pages/update" label="Pages templates"></b-menu-item>
                    <b-menu-item tag="router-link" to="/preferences/appearance.events/update" label="Event templates"></b-menu-item>
                    <b-menu-item tag="router-link" to="/preferences/appearance.emails/update" label="Email templates"></b-menu-item>
                </b-menu-list>
            </b-menu>
        </div>

        <div class="column pad">
            <transition name="quick-fade" mode="out-in">
                <router-view></router-view>
            </transition>
        </div>
    </div>
</template>

<script>
export default {
  name: "UserProfile"
}
</script>

<style scoped lang="scss">
    @import 'left-navbar.scss';
</style>
