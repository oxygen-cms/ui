<template>
    <div>
        <div v-if="loaded">
            <slot :value="value" :options="options" :update-value="updateValue">
                <div v-if="type === 'switch'">
                    <b-switch :value="value" @input="updateValue($event)">{{ label }}</b-switch>
                    <br /><br />
                </div>
                <b-field :label="label" label-position="inside" v-else-if="type === 'select'" class="pref-field">
                    <b-select v-if="grouped" placeholder="Select an value..." :value="value" @input="updateValue($event)">
                        <optgroup v-for="(suboptions) in options" :label="suboptions.value">
                            <option
                                v-for="(display, value) in suboptions.display"
                                :value="value"
                                :key="value">
                                {{ display }}
                            </option>
                        </optgroup>
                    </b-select>
                    <b-select v-else placeholder="Select an value..." :value="value" @input="updateValue($event)">
                        <option
                            v-for="option in options"
                            :value="option.value"
                            :key="option.value">
                            {{ option.display }}
                        </option>
                    </b-select>
                </b-field>
                <b-field v-else :label="label" :type="fieldType" :message="validationMessage" label-position="inside" class="pref-field">
                    <b-input v-model="value" class="pref-field-input" :type="type"></b-input>
                    <p class="control">
                        <b-button :loading="validating || updating" :type="(value !== serverValue && validationMessage === null && !validating) ? 'is-success' : ''" :disabled="value === serverValue || validationMessage !== null" @click="updateValue">Update</b-button>
                    </p>
                </b-field>
            </slot>
        </div>
        <div v-else class="pref-field-skeleton">
            <b-skeleton :animated="true" size="is-large"></b-skeleton>
        </div>
    </div>
</template>

<script>
import PreferencesApi from "../../PreferencesApi";
import debounce from 'lodash/debounce';
import {morphToNotification} from "../../api";

export default {
    name: "PreferencesField",
    props: {
        dataKey: String,
        label: String,
        type: {
            type: String,
            default: null
        },
        grouped: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            preferencesApi: new PreferencesApi(this.$buefy),
            loaded: false,
            hidden: false,
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
            if(this.validationMessage !== null) { return 'is-danger'; }
            else if(!this.validating && this.value !== this.serverValue) { return 'is-success'; }
            else { return ''; }
        }
    },
    watch: {
        'value': 'tryValidate'
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
            this.serverValue = serverData.value;
            this.value = this.serverValue;
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
            // this.paginatedItems.loading = true;
            // let data = await this.personApi.list({ q: this.personSearchQuery, tags: [], page: this.paginatedItems.currentPage });
            // this.paginatedItems.items = data.items;
            // this.paginatedItems.totalItems = data.totalItems;
            // this.paginatedItems.itemsPerPage = data.itemsPerPage;
            // this.paginatedItems.loading = false;
        }, 250),
        async updateValue(value) {
            if(typeof value === 'undefined') {
                value = this.value;
            }
            this.updating = true;
            let result = await this.preferencesApi.setValue(this.dataKey, value);
            this.updating = false;
            this.$buefy.toast.open(morphToNotification(result));
            this.serverValue = result.value;
            this.value = result.value;
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
</style>
