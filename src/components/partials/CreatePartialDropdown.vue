<template>
    <b-dropdown
        ref="dropdown"
        :position="minimal ? 'is-bottom-right' : 'is-bottom-left'"
        aria-role="menu"
        trap-focus
        append-to-body
        class="create-partial-dropdown">
        <template #trigger="{ active }">
            <MinimalDropdownButton v-if="minimal" icon="plus"/>
            <b-button v-else
                      :type="active ? '' : 'is-success'"
                      icon-left="pencil-alt"
                      :disabled="active">
                Create Partial
            </b-button>
        </template>

        <b-dropdown-item aria-role="menu-item" custom paddingless>
            <div class="modal-card" style="width: auto; overflow: visible">
                <header class="modal-card-head has-background-success-light">
                    <p class="modal-card-title">
                        <b-icon icon="puzzle-piece" size="is-normal" class="push-right"></b-icon>
                        Create Partial
                    </p>
                </header>
                <section class="modal-card-body" style="overflow: visible;">
                    <b-field label="Title">
                        <b-input
                            v-model="title"
                            placeholder="e.g.: Footer Copyright Text"
                            autofocus
                            @keyup.enter.native="submit">
                        </b-input>
                    </b-field>

                    <b-field label="Key" message="Leave blank to auto-generate from title">
                        <b-input
                            v-model="key"
                            :placeholder="slugifyKey(title) || 'e.g.: footer.copyright'"
                            @keyup.enter.native="submit">
                        </b-input>
                    </b-field>
                </section>
                <footer class="modal-card-foot is-flex">
                    <div class="is-flex-grow-1"></div>
                    <b-button @click="close">Cancel</b-button>
                    <b-button type="is-success" :loading="submitting" @click="submit">
                        Create Partial
                    </b-button>
                </footer>
            </div>
        </b-dropdown-item>
    </b-dropdown>
</template>

<script>
import PartialsApi from "../../PartialsApi.js";
import { morphToNotification } from "../../api.js";
import { slugifyKey } from "../../util.js";
import MinimalDropdownButton from "../MinimalDropdownButton.vue";

export default {
    name: "CreatePartialDropdown",
    components: { MinimalDropdownButton },
    props: {
        minimal: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            title: '',
            key: '',
            submitting: false,
            partialsApi: new PartialsApi()
        }
    },
    methods: {
        slugifyKey(str) {
            return slugifyKey(str);
        },
        async submit() {
            if (!this.title.trim()) {
                this.$buefy.toast.open({
                    type: 'is-danger',
                    message: 'Please enter a title'
                });
                return;
            }

            this.submitting = true;
            try {
                let data = {
                    title: this.title,
                    key: this.key || this.slugifyKey(this.title)
                };

                let response = await this.partialsApi.create(data);
                this.$buefy.toast.open(morphToNotification(response));
                this.close();
                this.$emit('created', response.item);
                this.$router.push('/partials/' + response.item.id + '/edit');
            } catch(e) {
                // Error handled by API layer
            }
            this.submitting = false;
        },
        close() {
            this.$refs.dropdown.toggle();
            // Reset form
            this.title = '';
            this.key = '';
        }
    }
}
</script>

<style>
    .create-partial-dropdown .dropdown-content {
        padding-top: 0;
        padding-bottom: 0;
    }

    .create-partial-dropdown .dropdown-menu {
        overflow: visible !important;
        min-width: 25rem;
    }

    .create-partial-dropdown .modal-card-title {
        flex-shrink: unset;
        flex-grow: unset;
    }
</style>
