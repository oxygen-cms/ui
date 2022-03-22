<template>
    <div class="full-height full-height-container pad">

        <div class="top-bar">
            <h1 class="title">System Preferences</h1>
        </div>

        <div class="box full-height-flex scroll-container">
            <b-tabs class="block">
                <slot :can-access-prefs="canAccessPrefs"></slot>
                <!-- If there were no tabs which are accessible, then display this tab as a fallback -->
                <b-tab-item v-if="!hasAtLeastOneAccess" label="General">
                    <em>No preferences found</em>
                </b-tab-item>
            </b-tabs>
        </div>
    </div>
</template>

<script>

import {canAccessPrefs} from "../../PreferencesApi";

export default {
    name: "PreferencesList",
    data() {
        return {
            hasAtLeastOneAccess: false
        }
    },
    computed: {
        userPermissions() {
            return this.$store.getters.userPermissions;
        }
    },
    methods: {
        canAccessPrefs(keys) {
            let result = canAccessPrefs(this.$buefy, this.userPermissions, keys);
            if(result) {
                this.hasAtLeastOneAccess = true;
            }
            return result;
        }
    }
}
</script>

<style scoped>
    @import '../util.css';
</style>
