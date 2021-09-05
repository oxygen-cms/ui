<template>
    <ShowIfPermitted data-key="appearance.themes">
        <h3 class="subtitle">Website Themes</h3>
        <PreferencesField data-key="appearance.themes::theme" label="">
            <template #default="slotProps">
                <b-table
                    :data="Object.values(slotProps.options)"
                    :striped="false">
                    <b-table-column v-slot="props" label="Key">
                        <img :src="props.row.image" class="theme-logo" />
                    </b-table-column>

                    <b-table-column v-slot="props" field="name" label="Name">
                        {{ props.row.name }}
                        <strong v-if="getSelectedOption(slotProps.options, slotProps.value) === props.row">(current theme)</strong>
                    </b-table-column>

                    <b-table-column v-slot="props" field="provides" label="Provides preferences">
                        <div v-for="(provideGroup, keyGroup) in props.row.provides" :key="keyGroup" class="is-size-7">
                            <span v-for="(value, key) in provideGroup" :key="key"><code>{{ keyGroup }}::{{ key}}</code><br></span>
                        </div>
                    </b-table-column>

                    <b-table-column v-slot="props" label="">
                        <b-button v-if="getSelectedOption(slotProps.options, slotProps.value) !== props.row" :loading="updating" @click="switchToTheme(props.row.key, slotProps.updateValue)">Switch to this theme</b-button>
                        <b-button v-else type="is-success" disabled>Theme is already active</b-button>
                    </b-table-column>
                </b-table>
            </template>
        </PreferencesField>
    </ShowIfPermitted>
</template>

<script>
import PreferencesField from "./PreferencesField.vue";
import ShowIfPermitted from "./ShowIfPermitted.vue";
export default {
    name: "PreferencesThemeChooser",
    components: {ShowIfPermitted, PreferencesField},
    data() {
        return {
            updating: false
        }
    },
    methods: {
        printTheme(theme) {
            return theme.display.name;
        },
        getSelectedOption(options, value) {
            return options[value];
        },
        async switchToTheme(value, updateFn) {
            console.log(value);
            this.updating = true;
            await updateFn(value);
            this.updating = false;
            this.$emit('theme-changed', value);
        }
    }
}
</script>

<style scoped lang="scss">
    .theme-logo {
        display: block;
        max-width: 10rem;
        margin: 0 auto;
    }

    .b-table ::v-deep .table td {
        vertical-align: middle;
    }
</style>
