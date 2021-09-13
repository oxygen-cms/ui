<template>
    <div v-show="permitted">
        <slot></slot>
    </div>
</template>

<script>
import {canAccessPrefs} from "../../PreferencesApi";
import UserPermissions from "../../UserPermissions";
import AuthApi from "../../AuthApi";

export default {
    name: "ShowIfPermitted",
    props: {
        dataKey: {
            type: String,
            default: null
        },
        keys: {
            type: Array,
            default: null
        }
    },
    computed: {
        keysArray() {
            if(this.keys === null) {
                return [this.dataKey];
            } else {
                return this.keys;
            }
        },
        permitted() { return canAccessPrefs(this.$buefy, this.$store.getters.userPermissions, this.keysArray); }
    }
}
</script>

<style scoped>

</style>
