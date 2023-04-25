<template>
    <div class="full-height-container pad">

        <div class="box middle-of-page">

            <div>
                <div class="has-background-grey-light huge-icon-container" style="display: inline-block;">
                    <b-icon icon="user" size="is-large" class="has-text-grey-lighter huge-icon"></b-icon>
                </div>
            </div>

            <h2 class="title">
                <transition name="fade" mode="out-in">
                    <span v-if="model">{{model.fullName}}</span>
                    <b-skeleton :active="!model" size="is-medium"></b-skeleton>
                </transition>
            </h2>
            <h3 class="subtitle">
                <transition name="fade" mode="out-in">
                <a v-if="model" :href="'mailto:' + model.email">{{ model.email }}</a>
                <b-skeleton :active="!model"></b-skeleton>
                </transition>
            </h3>

            <div v-if="model && model.id == currentUserId">
                <b-button type="is-primary" tag="router-link" to="/user/profile">Edit Your Profile</b-button>
            </div>

            <hr>

            <UserProfileDescription :user="model" :editable="false"></UserProfileDescription>

        </div>
    </div>
</template>

<script>
import UsersApi from "../UsersApi";
import UserProfileDescription from "./UserProfileDescription.vue";

export default {
    name: "UserProfilePage",
    components: {UserProfileDescription},
    data() {
        return {
            model: null,
            loading: true,
            usersApi: new UsersApi()
        }
    },
    computed: {
        currentUserId() {
            return this.$store.state.user.id;
        }
    },
    created() {
        this.fetchData();
    },
    methods: {
        async fetchData() {
            this.model = (await this.usersApi.getBasic(this.$route.params.id)).item;
            this.loading = false;
        }
    }
}
</script>

<style scoped>
    @import '~@oxygen-cms/ui/src/components/util.css';

    .middle-of-page {
        width: 40rem;
        max-width: 100%;
        margin-left: auto;
        margin-right: auto;
        text-align: center;
    }

    .huge-icon {
        width: 10rem;
        height: 10rem;
        font-size: 3rem;
    }

    .huge-icon-container {
        border-radius: 50%;
    }
</style>