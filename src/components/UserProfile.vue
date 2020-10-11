<template>
    <div class="columns">
        <div class="column pad is-one-fifth left-navigation-container">
            <b-menu class="left-navigation">
                <b-menu-list label="User">
                    <b-menu-item label="Profile" tag="router-link" to="/auth/profile"></b-menu-item>
                    <b-menu-item label="View recent logins" tag="router-link" to="/auth/login-log"></b-menu-item>
                </b-menu-list>

                <b-menu-list label="User Preferences">
                    <b-menu-item tag="a" href="/oxygen/preferences/user.general/update" label="Configure font-size"></b-menu-item>
                    <b-menu-item tag="a" href="/oxygen/preferences/user.editor/update" label="Configure editor appearance"></b-menu-item>
                    <b-menu-item tag="a" href="/oxygen/preferences/user.editor/update" label="Configure page loading"></b-menu-item>
                </b-menu-list>

                <b-menu-list label="System Preferences">
                    <b-menu-item tag="a" href="/oxygen/preferences/system.admin/update" label="Administration"></b-menu-item>
                    <b-menu-item tag="a" href="/oxygen/preferences/modules.auth/update" label="Authentication"></b-menu-item>
                    <b-menu-item tag="a" href="/oxygen/preferences/modules.pages/update" label="Pages"></b-menu-item>
                    <b-menu-item tag="a" href="/oxygen/preferences/modules.people/update" label="People"></b-menu-item>
                    <b-menu-item expanded>
                        <template slot="label" slot-scope="props">
                            Appearance
                            <b-icon class="is-pulled-right" :icon="props.expanded ? 'chevron-circle-down' : 'chevron-circle-up'"></b-icon>
                        </template>
                        <b-menu-item tag="a" href="/oxygen/preferences/appearance.themes/update" label="Themes"></b-menu-item>
                        <b-menu-item tag="a" href="/oxygen/preferences/appearance.admin/update" label="Administration"></b-menu-item>
                        <b-menu-item tag="a" href="/oxygen/preferences/appearance.auth/update" label="Login and Logout"></b-menu-item>
                        <b-menu-item tag="a" href="/oxygen/preferences/appearance.pages/update" label="Pages and Partials"></b-menu-item>
                        <b-menu-item tag="a" href="/oxygen/preferences/appearance.events/update" label="Events"></b-menu-item>
                        <b-menu-item tag="a" href="/oxygen/preferences/appearance.emails/update" label="Emails"></b-menu-item>
                    </b-menu-item>
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

<style scoped>
    @import './left-navbar.css';
    >>> .router-link-exact-active {
      background-color: white;
      color: #333;
    }

    >>> .menu-list a {
      margin: 0 -2em;
      padding-left: 2.75em;
      padding-right: 2.75em;
      border-radius: 0;
    }

    >>> .router-link-exact-active:hover {
      background-color: white;
      color: #333;
    }

    >>> .menu .menu-list a {
      display: flex;
      align-items: center;
    }

    >>> .menu .menu-list a .icon {
      margin-right: 10px;
    }
</style>
