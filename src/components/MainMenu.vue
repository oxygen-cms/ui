<template>
    <div v-if="userPermissions">
        <b-menu-list>
            <b-menu-item icon="home" tag="router-link" to="/dashboard" label="Dashboard"></b-menu-item>
        </b-menu-list>

        <b-menu-list v-for="(category, label) in categoriesWithPermission(items)"
                     :key="label"
                     :label="label">
            <b-menu-item v-for="(group, groupLabel) in groupsWithPermission(category)"
                         :key="groupLabel"
                         :icon="group.icon"
                         :tag="userPermissions.has(group.listPermission) ? 'router-link' : null"
                         :expanded="group.groupPrefix ? $route.fullPath.startsWith(group.groupPrefix) : null"
                         :to="group.listAction">
                <template #label>
                    {{ groupLabel }}
                    <span v-if="userPermissions.has(group.addPermission) && group.addDropdownComponent"
                          class="is-pulled-right show-if-active add-dropdown-trigger"
                          @click.stop.prevent
                          @mousedown.stop.prevent>
                        <component :is="group.addDropdownComponent"
                                   :minimal="true" />
                    </span>
                    <router-link v-else-if="userPermissions.has(group.addPermission)"
                               class="is-pulled-right show-if-active"
                               :to="group.addAction">
                        <MinimalDropdownButton :icon="group.addIcon" />
                    </router-link>
                </template>
                <b-menu-item v-for="(item, itemLabel) in itemsWithPermission(group.items)" :key="itemLabel" :label="itemLabel" tag="router-link" :to="item.to"></b-menu-item>
            </b-menu-item>
        </b-menu-list>

        <b-menu-list v-if="userPermissions && userPermissions.hasOneOf(['preferences.getValue', 'users.getList', 'groups.getList', 'importExport.getList'])" label="System">
            <b-menu-item v-if="userPermissions && userPermissions.has('preferences.getValue')" icon="cogs" tag="router-link" to="/preferences" label="Preferences"></b-menu-item>
            <b-menu-item v-if="userPermissions && userPermissions.has('users.getList')" icon="users" tag="router-link" to="/users" label="Users and Permissions"></b-menu-item>
        </b-menu-list>
    </div>

</template>

<script>
import MinimalDropdownButton from "./MinimalDropdownButton.vue";

export default {
    name: "MainMenu",
    components: { MinimalDropdownButton },
    props: {
        items: {
            type: Object,
            required: true
        }
    },
    computed: {
        userPermissions() { return this.$store.getters.userPermissions; }
    },
    methods: {
        categoriesWithPermission(categories) {
            return Object.fromEntries(Object.entries(categories).filter(([,category]) => this.userPermissions.hasOneOf(Object.values(category).flatMap((group) => this.getPermissionsForGroup(group))) ));
        },
        getPermissionsForGroup(group) {
            let values = Object.values(group.items).map(s => s.permission);
            if(group.addPermission) { values.push(group.addPermission); }
            if(group.listPermission) { values.push(group.listPermission); }
            return values;
        },
        itemsWithPermission(items) {
            return Object.fromEntries(Object.entries(items).filter(([, item]) => this.userPermissions.has(item.permission)));
        },
        groupsWithPermission(groups) {
            return Object.fromEntries(Object.entries(groups)
                .filter(([, group]) => this.userPermissions.hasOneOf(this.getPermissionsForGroup(group)))
                .sort(([,groupA], [,groupB]) => (groupB.order ?? 0) - (groupA.order ?? 0))
            );
        }
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
