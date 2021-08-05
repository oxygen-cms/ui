<template>
    <ShowIfPermitted data-key="appearance.events">
        <h3 class="subtitle">Events</h3>
        <PreferencesField data-key="appearance.events::contentView" label="Events Content View" :current-theme="currentTheme"></PreferencesField>
    </ShowIfPermitted>
</template>

<script>
import PreferencesField from "./PreferencesField.vue";
import ShowIfPermitted from "./ShowIfPermitted.vue";

export default {
    name: "PreferencesEventsTemplates",
    components: {ShowIfPermitted, PreferencesField },
    props: {
        currentTheme: {
            type: String,
            default: null
        }
    }
}
</script>
