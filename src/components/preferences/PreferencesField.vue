<template>
    <div>
        <div v-if="loaded">
            <slot :value="value" :options="options" :update-value="updateValue">
                <div class="horizontal-row">
                    <b-switch v-if="type === 'switch'" :value="value" :passive-type="isFallback ? 'is-dark' : ''" @input="updateValue($event)">{{ label }}</b-switch>
                    <b-field v-else-if="type === 'select'" :label="label"  label-position="inside"  class="pref-field">
                        <b-select v-if="grouped" :placeholder="selectPlaceholder" :value="value" @input="updateValue($event)">
                            <optgroup v-for="(suboptions, groupLabel) in options" :key="groupLabel" :label="groupLabel">
                                <option
                                    v-for="(display, optionValue) in suboptions"
                                    :key="optionValue"
                                    :value="optionValue">
                                    {{ display }}
                                </option>
                            </optgroup>
                        </b-select>
                        <b-select v-else :placeholder="selectPlaceholder" :value="value" @input="updateValue($event)">
                            <option
                                v-for="(optionDisplay, optionValue) in options"
                                :key="optionValue"
                                :value="optionValue">
                                {{ optionDisplay }}
                            </option>
                        </b-select>
                    </b-field>
                    <b-field v-else :label="label" :type="fieldType" :message="validationMessage" label-position="inside">
                        <b-input v-model="value" class="pref-field-input" :type="type" :placeholder="fallbackValue"></b-input>
                        <p class="control">
                            <b-button :loading="validating || updating" :type="(value !== serverValue && validationMessage === null && !validating) ? 'is-success' : ''" :disabled="value === serverValue || validationMessage !== null" @click="updateValue()">Update</b-button>
                        </p>
                    </b-field>
                    <b-button v-if="hasFallback" :disabled="!hasFallback || isFallback" type="is-light" size="is-small" :loading="updating" @click="clearValue()">
                        <span v-if="!isFallback">Use default from {{ defaultText }}</span>
                        <span v-else>Inherited  from {{ defaultText }}</span>
                    </b-button>
                </div>
            </slot>
        </div>
        <div v-else class="pref-field-skeleton">
            <b-skeleton :animated="true" size="is-large"></b-skeleton>
        </div>
    </div>
</template>

<script>
import PreferencesApi from "../../PreferencesApi";
import { debounce } from "lodash";
import {morphToNotification} from "../../api";

export default {
    name: "PreferencesField",
    props: {
        dataKey: { type: String, required: true },
        label: { type: String, required: true },
        type: {
            type: String,
            default: null
        },
        grouped: {
            type: Boolean,
            default: false
        },
        currentTheme: {
            type: String,
            default: null
        },
        defaultText: {
            type: String,
            default: 'theme'
        }
    },
    data() {
        return {
            preferencesApi: new PreferencesApi(this.$buefy),
            loaded: false,
            hidden: false,
            fallbackValue: null,
            serverValue: null,
            value: null,
            options: [],
            validating: false,
            updating: false,
            validationMessage: null
        }
    },
    computed: {
        fieldType() {
            if(this.isFallback) { return 'is-dark'; }
            else if(this.validationMessage !== null) { return 'is-danger'; }
            else if(!this.validating && this.value !== this.serverValue) { return 'is-success'; }
            else { return ''; }
        },
        isFallback() {
            return this.fallbackValue !== null && (this.value === null || this.value === '');
        },
        hasFallback() {
            return this.fallbackValue !== null;
        },
        selectPlaceholder() {
            if(this.fallbackValue !== null) {
                if(this.grouped) {
                    let entries = Object.entries(this.options).flatMap(args => { return Object.entries(args[1]); });
                    console.log(entries);
                    return entries.filter(args => args[0] === this.fallbackValue).map(args => args[1])[0];
                } else {
                    let entries = Object.entries(this.options);
                    console.log(entries);
                    return entries.filter(args => args[0] === this.fallbackValue).map(args => args[1])[0];
                }
            }
            return 'Select a value...';
        }
    },
    watch: {
        'value': 'tryValidate',
        'currentTheme': 'fetchData'
    },
    mounted() {
        this.fetchData()
    },
    methods: {
        async fetchData() {
            let serverData = await this.preferencesApi.getValue(this.dataKey);
            if(serverData.permissions === false) {
                return;
            }
            this.serverValue = serverData.primaryValue;
            this.value = this.serverValue;
            this.fallbackValue = serverData.fallbackValue;
            this.options = serverData.options;
            this.loaded = true;
        },
        tryValidate() {
            if(this.value === this.serverValue) {
                this.validationMessage = null;
                return;
            }
            this.validating = true;
            this.validateDebounced();
        },
        validateDebounced: debounce(async function () {
            let result = await this.preferencesApi.checkValid(this.dataKey, this.value);
            this.validating = false;
            console.log(
                result
            );
            this.validationMessage = result.reason ? result.reason : null;
        }, 250),
        async updateValue(value) {
            if(typeof value === 'undefined') {
                value = this.value;
            }
            this.updating = true;
            let result = await this.preferencesApi.setValue(this.dataKey, value);
            this.handleUpdateResult(result);
        },
        handleUpdateResult(result) {
            this.updating = false;
            if(result.reason) {
                this.validationMessage = result.reason ? result.reason : null;
                return;
            }
            this.updating = false;
            this.$buefy.toast.open(morphToNotification(result));
            this.serverValue = result.primaryValue;
            this.value = result.primaryValue;
            this.fallbackValue = result.fallbackValue;
        },
        async clearValue() {
            this.updating = true;
            let result = await this.preferencesApi.setValue(this.dataKey, null);
            this.handleUpdateResult(result);
        }
    }
}
</script>

<style scoped>
    .pref-field {
        margin-bottom: 0.75rem;
    }

    .pref-field-input {
        width: 100%;
        max-width: 30rem;
    }

    .pref-field-skeleton .b-skeleton {
        margin-bottom: 1rem;
        width: 100%;
        max-width: 40rem;
    }

    .pref-field-skeleton ::v-deep .b-skeleton-item {
        line-height: 2.5rem;
    }

    .horizontal-row {
        margin-bottom: 0.75rem;
        display: flex;
        align-items: center;
    }

    .horizontal-row .field,
    .horizontal-row .switch {
        margin-bottom: 0;
        flex: 1;
        max-width: 35rem;
    }

    .horizontal-row > .button {
        margin-left: 1rem;
    }
</style>
