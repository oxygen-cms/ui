<template>
    <div class="full-height full-height-container pad">

        <div class="top-bar">
            <h1 class="title">System Preferences</h1>
        </div>

        <div class="box full-height-flex scroll-container">

            <transition name="fade">
                <div v-if="user">
                    <b-tabs class="block">
                        <slot :can-access-prefs="canAccessPrefs"></slot>
                        <!-- If there were no tabs which are accessible, then display this tab as a fallback -->
                        <b-tab-item v-if="!hasAtLeastOneAccess" label="General">
                            <em>No preferences found</em>
                        </b-tab-item>
                    </b-tabs>
                </div>
            </transition>
        </div>
    </div>
</template>

<script>

import {canAccessPrefs} from "../../PreferencesApi";
import UserPermissions from "../../UserPermissions";
import AuthApi from "../../AuthApi";

export default {
    name: "PreferencesView",
    data() {
        return {
            user: null,
            hasAtLeastOneAccess: false
        }
    },
    async mounted() {
        this.user = (await new AuthApi(this.$buefy).userDetails()).user;
    },
    methods: {
        canAccessPrefs(keys) {
            let userPermissions = new UserPermissions(this.user.permissions);
            let result = canAccessPrefs(this.$buefy, userPermissions, keys);
            if(result) {
                this.hasAtLeastOneAccess = true;
            }
            return result;
        }
    }
}
</script>

<style scoped>

</style>
