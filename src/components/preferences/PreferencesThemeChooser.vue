<template>
    <ShowIfPermitted data-key="appearance.themes">
        <h3 class="subtitle">Website Themes</h3>
        <PreferencesField data-key="appearance.themes::theme" label="">
            <template v-slot:default="slotProps">
                <b-table
                    :data="Object.values(slotProps.options)"
                    :striped="false">
                    <b-table-column label="Key" v-slot="props">
                        <img :src="props.row.image" class="theme-logo" />
                    </b-table-column>

                    <b-table-column field="name" label="Name" v-slot="props">
                        {{ props.row.name }}
                        <strong v-if="getSelectedOption(slotProps.options, slotProps.value) === props.row">(current theme)</strong>
                    </b-table-column>

                    <b-table-column field="provides" label="Provides preferences" v-slot="props">
                        <div v-for="(provideGroup, keyGroup) in props.row.provides" class="is-size-7">
                            <span v-for="(value, key) in provideGroup"><code>{{ keyGroup }}::{{ key}}</code><br></span>
                        </div>
                    </b-table-column>

                    <b-table-column label="" v-slot="props">
                        <b-button v-if="getSelectedOption(slotProps.options, slotProps.value) !== props.row" @click="switchToTheme(props.row.key, slotProps.updateValue)" :loading="updating">Switch to this theme</b-button>
                        <b-button type="is-success" disabled v-else>Theme is already active</b-button>
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
