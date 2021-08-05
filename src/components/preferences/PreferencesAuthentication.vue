<template>
    <ShowIfPermitted data-key="modules.auth">
        <h3 class="subtitle">Views</h3>
        <PreferencesField data-key="modules.auth::dashboard" label="Dashboard View" type="select" :current-theme="currentTheme"></PreferencesField>
        <PreferencesField data-key="modules.auth::home" label="Home View" type="select" :current-theme="currentTheme"></PreferencesField>

        <h3 class="subtitle">Logging</h3>
        <PreferencesField data-key="modules.auth::notifyWhenNewDevice" label="Notify user when logging in from a new device" type="switch" :current-theme="currentTheme"></PreferencesField>
        <PreferencesField data-key="modules.auth::loginLogExpiry" label="Number of days to keep authentication log entries" type="number" :current-theme="currentTheme"></PreferencesField>
    </ShowIfPermitted>
</template>

<script>
import PreferencesField from "./PreferencesField.vue";
import ShowIfPermitted from "./ShowIfPermitted.vue";

export default {
    name: "PreferencesAuthentication",
    components: {ShowIfPermitted, PreferencesField },
    props: {
        currentTheme: {
            type: String,
            default: null
        }
    }
}
</script>
