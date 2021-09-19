<template>
    <transition name="fade" mode="out-in">
        <div v-if="updatedValue === null">
            <slot name="display" v-bind:edit="edit" v-bind:value="data[fieldName]">
                <p>
                    {{ data[fieldName] }}
                    <EditButtonOnRowHover :edit="edit" />
                </p>
            </slot>
        </div>
        <slot name="edit" v-else v-bind:submit="submitValue" v-bind:initial-value="data[fieldName]" v-bind:updating="updating">
            <b-field :label="label" :label-position="label ? 'inside' : null">
                <b-input v-model="updatedValue" :type="type" @keyup.enter.native="submit" :disabled="updating" class="not-full-width"></b-input>
                <p class="control">
                    <b-button type="is-primary" :loading="updating" @click="submit">Change</b-button>
                </p>
            </b-field>
        </slot>
    </transition>
</template>

<script>
import {morphToNotification} from "../api";
import UsersApi from "../UsersApi";
import EditButtonOnRowHover from "./EditButtonOnRowHover.vue";

export default {
    name: "GenericEditableField",
    components: {EditButtonOnRowHover},
    props: {
        api: { type: Object, required: true},
        data: { type: Object, required: true },
        fieldName: { type: String, required: true },
        label: { type: String, default: null },
        type: { type: String, default: 'text' }
    },
    data() {
        return {
            updatedValue: null,
            updating: false,
        };
    },
    methods: {
        async submitValue(value) {
            this.updatedValue = value;
            this.submit();
        },
        async submit() {
            this.updating = true;
            let data = {
                id: this.data.id
            };
            data[this.fieldName] = this.updatedValue;
            try {
                let response = this.fieldName === 'fullName' ? await this.api.updateFullName(this.data.id, this.updatedValue) : await this.api.update(data);
                this.updating = false;
                this.updatedValue = null;
                this.$buefy.toast.open(morphToNotification(response));
                this.$emit('update:data', response.item);
            } catch(e) {
                this.updating = false;
            }
        },
        edit() {
            this.updatedValue = this.data[this.fieldName];
        },
    }
}
</script>

<style scoped>
    .not-full-width {
        width: 15rem;
    }
</style>