<template>
    <PreferencesList>
        <template #default="slotProps">
            <b-tab-item v-if="slotProps.canAccessPrefs(['appearance.themes', 'appearance.pages', 'appearance.events'].concat(getExtraPrefsPermissions('appearance')))" label="Website Theme">
                <PreferencesThemeChooser @theme-changed="onThemeChanged" />
                <PreferencesPageTemplates :current-theme="currentTheme" />

                <PreferencesSiteAppearance :current-theme="currentTheme" />
                <component :is="pref.component" v-for="pref in getExtraPrefs('appearance')" :key="pref.key" :current-theme="currentTheme" />
            </b-tab-item>
            <b-tab-item v-if="slotProps.canAccessPrefs(getExtraPrefsPermissions('external'))" label="External Integrations">
                <component :is="pref.component" v-for="pref in getExtraPrefs('external')" :key="pref.key" :current-theme="currentTheme" />
            </b-tab-item>
            <b-tab-item v-if="slotProps.canAccessPrefs(['modules.auth'])" label="Authentication & Security">
                <PreferencesAuthentication :current-theme="currentTheme" />
            </b-tab-item>
            <b-tab-item v-if="slotProps.canAccessPrefs(['appearance.auth'])" label="Admin Look & Feel">
                <PreferencesAdminAppearance :current-theme="currentTheme" />
            </b-tab-item>
            <b-tab-item v-if="userPermissions.has('importExport.getExport')" label="Website Data">
                <ImportExport />
            </b-tab-item>
        </template>
    </PreferencesList>
</template>

<script>

import PreferencesList from './PreferencesList.vue';
import PreferencesPageTemplates from './PreferencesPageTemplates.vue';
import PreferencesEventTemplates from './PreferencesEventTemplates.vue';
import PreferencesThemeChooser from './PreferencesThemeChooser.vue';
import PreferencesAuthentication from './PreferencesAuthentication.vue';
import PreferencesAdminAppearance from './PreferencesAdminAppearance.vue';
import PreferencesSiteAppearance from './PreferencesSiteAppearance.vue';
import ImportExport from '../ImportExport.vue';

export default {
    name: "Preferences",
    components: {
        PreferencesList,
        PreferencesPageTemplates,
        PreferencesEventTemplates,
        PreferencesThemeChooser,
        PreferencesAuthentication,
        PreferencesAdminAppearance,
        PreferencesSiteAppearance,
        ImportExport
    },
    props: {
        extraPrefs: {
            type: Object,
            default: () => { return {}; }
        }
    },
    data() {
        return {
            currentTheme: null,
        }
    },
    computed: {
        userPermissions() {
            return this.$store.getters.userPermissions;
        }
    },
    methods: {
        onThemeChanged(currentTheme) {
            this.currentTheme = currentTheme;
        },
        getExtraPrefsPermissions(category) {
            return (this.extraPrefs[category] ?? []).map(pref => pref.key);
        },
        getExtraPrefs(category) {
            return (this.extraPrefs[category] ?? []);
        }
    }
}
</script>

<style scoped>

</style>
