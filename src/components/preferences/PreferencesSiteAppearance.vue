<template>
    <ShowIfPermitted data-key="appearance.site">
        <h3 class="subtitle">Error Pages</h3>
        <PreferencesField data-key="appearance.site::errorViewPrefix" label="Error View Prefix" :current-theme="currentTheme"></PreferencesField>
    </ShowIfPermitted>
</template>

<script>
import PreferencesField from "./PreferencesField.vue";
import ShowIfPermitted from "./ShowIfPermitted.vue";

export default {
    name: "PreferencesSiteAppearance",
    components: {ShowIfPermitted, PreferencesField },
    props: {
        currentTheme: {
            type: String,
            default: null
        }
    }
}
</script>
