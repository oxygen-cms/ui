<template>
    <div>
        <b-menu-list>
            <b-menu-item icon="home" tag="router-link" to="/dashboard" label="Dashboard"></b-menu-item>
        </b-menu-list>

        <b-menu-list v-for="(category, label) in items"
                     :key="label"
                     v-if="userPermissions && userPermissions.hasOneOf(Object.values(category).flatMap((group) => getPermissionsForGroup(group)))"
                     :label="label">
            <b-menu-item v-for="(group, groupLabel) in category"
                         :key="groupLabel"
                         :icon="group.icon"
                         v-if="userPermissions.hasOneOf(getPermissionsForGroup(group))"
                         :tag="userPermissions.has(group.listPermission) ? 'router-link' : null"
                         :expanded="group.groupPrefix ? $route.fullPath.startsWith(group.groupPrefix) : null"
                         :to="group.listAction">
                <template #label>
                    {{ groupLabel }}
                    <b-button v-if="userPermissions.has(group.addPermission)"
                              tag="router-link"
                              type="is-text"
                              class="is-pulled-right show-if-active"
                              :icon-right="group.addIcon"
                              :to="group.addAction"></b-button>
                </template>
                <b-menu-item v-for="(item, itemLabel) in group.items" :key="itemLabel" v-if="userPermissions.has(item.permission)" :label="itemLabel" tag="router-link" :to="item.to"></b-menu-item>
            </b-menu-item>
        </b-menu-list>

        <b-menu-list label="System" v-if="userPermissions && userPermissions.hasOneOf(['preferences.getValue', 'users.getList', 'groups.getList', 'importExport.getList'])">
            <b-menu-item v-if="userPermissions && userPermissions.has('preferences.getValue')" icon="cogs" tag="router-link" to="/preferences" label="Preferences"></b-menu-item>
            <b-menu-item v-if="userPermissions && userPermissions.has('users.getList')" icon="users" tag="router-link" to="/users" label="Users and Permissions"></b-menu-item>
        </b-menu-list>
    </div>

</template>

<script>
export default {
    name: "MainMenu",
    props: {
        items: Object
    },
    data() {
        return {
            getPermissionsForGroup: (group) => {
                let values = Object.values(group.items).map(s => s.permission);
                if(group.addPermission) { values.push(group.addPermission); }
                if(group.listPermission) { values.push(group.listPermission); }
                console.log(values);
                return values;
            }
        };
    },
    computed: {
        userPermissions() { return this.$store.getters.userPermissions; }
    }
}
</script>

<style scoped lang="scss">
    .show-if-active {
        visibility: hidden;
        opacity: 0;
        padding: 0;
        transition: visibility 0.2s ease, opacity 0.2s ease;
        height: auto;

        .router-link-active & {
            visibility: visible;
            opacity: 1;
        }

        .menu-list li:hover & {
            visibility: visible;
            opacity: 1;
        }
    }

    .left-navigation-container.is-collapsed .show-if-active {
        visibility: hidden !important;
        opacity: 0 !important;
    }
</style>

<style>
.show-if-active .icon:first-child:last-child {
    margin-left: 0;
    margin-right: 0;
}
</style>
