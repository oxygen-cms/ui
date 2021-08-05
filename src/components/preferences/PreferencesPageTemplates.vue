<template>
    <ShowIfPermitted data-key="appearance.pages">
        <h3 class="subtitle">Pages</h3>
        <PreferencesField data-key="appearance.pages::theme" label="Page Template" :current-theme="currentTheme"></PreferencesField>
        <PreferencesField data-key="appearance.pages::contentView" label="Page Preview Template" :current-theme="currentTheme"></PreferencesField>
    </ShowIfPermitted>
</template>

<script>
import PreferencesField from "./PreferencesField.vue";
import ShowIfPermitted from "./ShowIfPermitted.vue";

export default {
    name: "PreferencesPageTemplates",
    components: {ShowIfPermitted, PreferencesField },
    props: {
        currentTheme: {
            type: String,
            default: null
        }
    }
}
</script>
