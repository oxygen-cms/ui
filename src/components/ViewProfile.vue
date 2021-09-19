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
import UserProfileForm from "./UserProfileForm.vue";

export default {
    name: "ViewProfile",
    components: {UserProfileForm},
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