<template>
    <div class="full-height scroll-container pad">
        <div class="card">
            <div class="card-content">
                <UserProfileForm :user="user" @update:user="updateUser" />
            </div>
        </div>
    </div>
</template>

<script>
import AuthApi from "../AuthApi";
import UserPreferences from "./preferences/UserPreferences.vue";
import ShowIfPermitted from "./preferences/ShowIfPermitted.vue";
import UserJoined from "./UserJoined.vue";
import UserProfileForm from "./UserProfileForm.vue";

export default {
    name: "ViewProfile",
    components: {UserProfileForm, UserJoined, ShowIfPermitted, UserPreferences},
    data() {
        return {
            authApi: new AuthApi(this.$buefy)
        }
    },
    computed: {
        user() { return this.$store.state.user; }
    },
    methods: {
        updateUser(user) {
            this.$store.commit('setUser', user);
        }
    }
}
</script>