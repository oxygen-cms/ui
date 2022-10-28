<template>
    <div class="content">
        <div class="level level-left">
            <strong class="mr-2">Username:</strong>
            <span v-if="user">{{ user.username }}
                <b-tooltip v-if="editable" label="To change username, please contact your administrator." position="is-right" multilined><b-icon icon="info-circle"></b-icon></b-tooltip>
            </span>
        </div>
        <div class="level level-left"><strong class="mr-2">Group: </strong>
            <transition name="fade" mode="out-in">
                    <span v-if="user">{{ user.group.name }}
                        <b-tooltip :label="user.group.description" position="is-right" multilined><b-icon icon="info-circle"></b-icon></b-tooltip>
                    </span>
                <b-skeleton v-else width="20%" :animated="true" />
            </transition>
        </div>
        <div class="level level-left"><strong class="mr-2">Joined: </strong>
            <transition name="fade" mode="out-in">
                <UserJoined v-if="user" :user="user" />
                <b-skeleton v-else width="20%" :animated="true" />
            </transition>
        </div>
    </div>
</template>

<script>
import UserJoined from "./UserJoined.vue";

export default {
    name: "UserProfileDescription",
    components: { UserJoined },
    props: {
        user: { type: Object, default: null },
        editable: { type: Boolean, required: true }
    }
}
</script>

<style scoped>

</style>