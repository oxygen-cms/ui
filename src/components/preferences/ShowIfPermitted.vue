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
    data() {
        return {
            permitted: false
        }
    },
    async mounted() {
        let keys = this.keys;
        if(keys === null) {
            keys = [this.dataKey];
        }
        let userPermissions = new UserPermissions((await new AuthApi(this.$buefy).userDetails()).user.permissions);
        this.permitted = await canAccessPrefs(this.$buefy, userPermissions, keys);
    }
}
</script>

<style scoped>

</style>
