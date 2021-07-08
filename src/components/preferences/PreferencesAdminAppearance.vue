<template>
    <ShowIfPermitted data-key="appearance.auth">
        <h3 class="subtitle">Login</h3>
        <PreferencesField data-key="appearance.auth::theme" label="Login Theme" type="select"></PreferencesField>
    </ShowIfPermitted>
</template>

<script>
import PreferencesField from "./PreferencesField.vue";
import ShowIfPermitted from "./ShowIfPermitted.vue";

export default {
    name: "PreferencesAdminAppearance",
    components: {ShowIfPermitted, PreferencesField }
}
</script>
