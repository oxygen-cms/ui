<template>
    <div class="columns">
        <div class="column pad is-one-fifth left-navigation-container">
            <b-menu class="left-navigation">
                <b-menu-list label="My Profile">
                    <b-menu-item icon="list" label="View Profile" tag="router-link" to="/auth/profile"></b-menu-item>
                    <b-menu-item icon="pencil-alt" label="Edit Profile" tag="router-link" to="/auth/profile/edit"></b-menu-item>
                    <b-menu-item icon="user" tag="router-link" to="/auth/profile/change-password" label="Change Password"></b-menu-item>
                </b-menu-list>

                <b-menu-list label="Change Preferences">
                    <b-menu-item icon="ticket-alt" tag="router-link" to="/people/trybooking-import" label="Import from TryBooking"></b-menu-item>
                    <b-menu-item icon="mail-bulk" tag="router-link" to="/people/mailgun-export" label="Export to Mailgun Mailing List"></b-menu-item>
                    <b-menu-item icon="ban" tag="router-link" to="/people/mailgun-check-unsubscribes" label="Check Mailgun for Unsubscribes"></b-menu-item>
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
