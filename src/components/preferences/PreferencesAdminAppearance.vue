<template>
    <ShowIfPermitted data-key="appearance.auth">
        <h3 class="subtitle">Login</h3>
        <PreferencesField data-key="appearance.auth::theme" label="Login Theme" type="select" :current-theme="currentTheme"></PreferencesField>
    </ShowIfPermitted>
</template>

<script>
import PreferencesField from "./PreferencesField.vue";
import ShowIfPermitted from "./ShowIfPermitted.vue";

export default {
    name: "PreferencesAdminAppearance",
    components: {ShowIfPermitted, PreferencesField },
    props: {
        currentTheme: {
            type: String,
            default: null
        }
    }
}
</script>
