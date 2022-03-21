<template>
    <PreferencesList>
        <template v-slot:default="slotProps">
            <b-tab-item label="Website Theme" v-if="slotProps.canAccessPrefs(['appearance.themes', 'appearance.pages', 'appearance.events'].concat(getExtraPrefsPermissions('appearance')))">
                <PreferencesThemeChooser @theme-changed="onThemeChanged" />
                <PreferencesPageTemplates :current-theme="currentTheme" />
                <PreferencesEventTemplates :current-theme="currentTheme" />
                <PreferencesSiteAppearance :current-theme="currentTheme" />
                <component v-for="pref in getExtraPrefs('appearance')" :key="pref.key" :is="pref.component" :current-theme="currentTheme" />
            </b-tab-item>
            <b-tab-item label="External Integrations" v-if="slotProps.canAccessPrefs(getExtraPrefsPermissions('external'))">
                <component v-for="pref in getExtraPrefs('external')" :key="pref.key" :is="pref.component" :current-theme="currentTheme" />
            </b-tab-item>
            <b-tab-item label="Authentication & Security" v-if="slotProps.canAccessPrefs(['modules.auth'])">
                <PreferencesAuthentication :current-theme="currentTheme" />
            </b-tab-item>
            <b-tab-item label="Admin Look & Feel" v-if="slotProps.canAccessPrefs(['appearance.auth'])">
                <PreferencesAdminAppearance :current-theme="currentTheme" />
            </b-tab-item>
            <b-tab-item label="Website Data" v-if="userPermissions.has('importExport.getExport')">
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
        extraPrefs: Object
    },
    data() {
        return {
            currentTheme: null,
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
    },
    computed: {
        userPermissions() {
            return this.$store.getters.userPermissions;
        }
    }
}
</script>

<style scoped>

</style>
