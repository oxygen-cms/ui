<template>
    <div>
        <h3 class="subtitle">General</h3>
        <PreferencesField label="Font Size" data-key="user.general::fontSize" type="select" default-text="group"></PreferencesField>
        <h3 class="subtitle">Editor</h3>
        <PreferencesField label="Default Mode" data-key="user.editor::defaultMode" type="select" default-text="group"></PreferencesField>
        <PreferencesField label="Overall Theme" data-key="user.editor::theme" type="select" default-text="group"></PreferencesField>
        <h4 class="subtitle is-6">Code Editor</h4>
        <PreferencesField label="Theme" data-key="user.editor::ace.theme" type="select" grouped default-text="group"></PreferencesField>
        <PreferencesField label="Font Size" data-key="user.editor::ace.fontSize" type="select" default-text="group"></PreferencesField>
        <PreferencesField label="Word Wrap" data-key="user.editor::ace.wordWrap" type="switch" default-text="group"></PreferencesField>
        <PreferencesField label="Highlight Active Line" data-key="user.editor::ace.highlightActiveLine" type="switch" default-text="group"></PreferencesField>
        <PreferencesField label="Show Print Margin" data-key="user.editor::ace.showPrintMargin" type="switch" default-text="group"></PreferencesField>
        <PreferencesField label="Show Invisibles" data-key="user.editor::ace.showInvisibles" type="switch" default-text="group"></PreferencesField>
        <h4 class="subtitle is-6">Design Editor</h4>
        <PreferencesField label="Theme" data-key="user.editor::ckeditor.skin" type="select" grouped default-text="group"></PreferencesField>
    </div>
</template>

<script>
import PreferencesField from "./PreferencesField.vue";
export default {
    name: "UserPreferences",
    components: {PreferencesField}
}
</script>

<style scoped>

</style>
