<template>
    <ShowIfPermitted data-key="appearance.themes">
        <h3 class="subtitle">Website Themes</h3>
        <PreferencesField data-key="appearance.themes::theme" label="">
            <template v-slot:default="slotProps">
                <b-table
                    :data="slotProps.options"
                    :striped="false">
                    <b-table-column field="name" label="Name" v-slot="props">
                        {{ props.row.display.name }}
                        <strong v-if="getSelectedOption(slotProps.options, slotProps.value) === props.row">(current theme)</strong>
                    </b-table-column>

                    <b-table-column field="key" label="Key" v-slot="props">
                        <code>{{ props.row.display.key }}</code>
                    </b-table-column>

                    <b-table-column field="provides" label="Provides preferences" v-slot="props">
                        <div v-for="(provideGroup, keyGroup) in props.row.display.provides">
                            <span v-for="(value, key) in provideGroup">{{ keyGroup }}::{{ key}} <br></span>
                        </div>
                    </b-table-column>

                    <b-table-column label="" v-slot="props">
                        <b-button v-if="getSelectedOption(slotProps.options, slotProps.value) !== props.row" @click="switchToTheme(props.row, slotProps.updateValue)" :loading="updating">Switch to this theme</b-button>
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
            let items = options.filter((option) => {
                return option.display.key === value;
            });
            if(items.length > 0) {
                return items[0];
            } else {
                return null;
            }
        },
        async switchToTheme(row, updateFn) {
            console.log(row);
            this.updating = true;
            await updateFn(row.value);
            this.updating = false;
        }
    }
}
</script>
