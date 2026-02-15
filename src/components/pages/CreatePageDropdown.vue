<template>
    <b-dropdown
        ref="dropdown"
        :position="minimal ? 'is-bottom-right' : 'is-bottom-left'"
        aria-role="menu"
        trap-focus
        append-to-body
        class="create-page-dropdown">
        <template #trigger="{ active }">
            <MinimalDropdownButton v-if="minimal" icon="plus"/>
            <b-button v-else
                      :type="active ? '' : 'is-success'"
                      icon-left="pencil-alt"
                      :disabled="active">
                Create Page
            </b-button>
        </template>

        <b-dropdown-item aria-role="menu-item" custom paddingless>
            <div class="modal-card" style="width: auto; overflow: visible">
                <header class="modal-card-head has-background-success-light">
                    <p class="modal-card-title">
                        <b-icon icon="file-alt" size="is-normal" class="push-right"></b-icon>
                        Create Page
                    </p>
                </header>
                <section class="modal-card-body" style="overflow: visible;">
                    <b-field label="Title">
                        <b-input
                            v-model="title"
                            placeholder="e.g.: About Us"
                            autofocus
                            @keyup.enter.native="submit">
                        </b-input>
                    </b-field>

                    <b-field label="URL Part" message="Leave blank to auto-generate from title">
                        <b-input
                            v-model="slugPart"
                            :placeholder="slugifyTitle(title) || 'e.g.: about-us'"
                            @keyup.enter.native="submit">
                        </b-input>
                    </b-field>

                    <b-field label="Parent Page">
                        <b-autocomplete
                            v-if="!selectedParent"
                            v-model="parentSearchQuery"
                            :disabled="isLoading"
                            open-on-focus
                            :data="sortedPagesList"
                            placeholder="Search for parent page..."
                            clearable
                            @select="onSelectParent"
                            @input="onParentSearchInput">
                            <template #default="props">
                                <span :style="props.option.slug === '/' ? 'font-weight: bold;' : ''">
                                    {{ props.option.title }} - {{ props.option.slug }}
                                </span>
                            </template>
                            <template #empty>No results found</template>
                        </b-autocomplete>
                        <div v-else style="display: flex; align-items: center; padding: 0.5rem 0.75rem; border: 1px solid #dbdbdb; border-radius: 4px; background-color: #f5f5f5;">
                            <span style="flex: 1;">
                                <strong>{{ selectedParent.title }}</strong> - {{ selectedParent.slug }}
                            </span>
                            <a style="color: #f14668; cursor: pointer; margin-left: 0.5rem;" @click.stop="clearSelectedParent">
                                <b-icon icon="times" size="is-small"></b-icon>
                            </a>
                        </div>
                    </b-field>
                </section>
                <footer class="modal-card-foot is-flex">
                    <div class="is-flex-grow-1"></div>
                    <b-button @click="close">Cancel</b-button>
                    <b-button type="is-success" :loading="submitting" @click="submit">
                        Create Page
                    </b-button>
                </footer>
            </div>
        </b-dropdown-item>
    </b-dropdown>
</template>

<script>
import PagesApi from "../../PagesApi.js";
import { morphToNotification } from "../../api.js";
import { slugify } from "../../util.js";
import MinimalDropdownButton from "../MinimalDropdownButton.vue";

export default {
    name: "CreatePageDropdown",
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
            slugPart: '',
            parentSearchQuery: '',
            selectedParent: null,
            submitting: false,
            isLoading: false,
            pagesList: [],
            pagesApi: new PagesApi()
        }
    },
    computed: {
        sortedPagesList() {
            // Sort with Home page (slug '/') at the top, then alphabetically by title
            return [...this.pagesList].sort((a, b) => {
                if (a.slug === '/') return -1;
                if (b.slug === '/') return 1;
                return a.title.localeCompare(b.title);
            });
        }
    },
    watch: {
        'parentSearchQuery': 'fetchPages'
    },
    created() {
        this.fetchPages();
    },
    methods: {
        slugifyTitle(str) {
            return slugify(str);
        },
        async fetchPages() {
            this.isLoading = true;
            let data = await this.pagesApi.list({ inTrash: false, page: 1, q: this.parentSearchQuery });
            this.pagesList = data.items;
            this.isLoading = false;
        },
        onSelectParent(option) {
            this.selectedParent = option;
            // Clear the search query after selection to reset the autocomplete
            this.$nextTick(() => {
                this.parentSearchQuery = '';
            });
        },
        onParentSearchInput() {
            // Clear selected parent if user starts typing
            if (this.parentSearchQuery && this.selectedParent) {
                this.selectedParent = null;
            }
        },
        clearSelectedParent() {
            this.selectedParent = null;
            this.parentSearchQuery = '';
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
                    slugPart: this.slugPart || this.slugifyTitle(this.title),
                    parent: this.selectedParent ? this.selectedParent.id : null
                };

                let response = await this.pagesApi.create(data);
                this.$buefy.toast.open(morphToNotification(response));
                this.close();
                this.$emit('created', response.item);
                this.$router.push('/pages/' + response.item.id + '/edit');
            } catch(e) {
                // Error handled by API layer
            }
            this.submitting = false;
        },
        close() {
            this.$refs.dropdown.toggle();
            // Reset form
            this.title = '';
            this.slugPart = '';
            this.parentSearchQuery = '';
            this.selectedParent = null;
        }
    }
}
</script>

<style>
    .create-page-dropdown .dropdown-content {
        padding-top: 0;
        padding-bottom: 0;
    }

    .create-page-dropdown .dropdown-menu {
        overflow: visible !important;
        min-width: 25rem;
    }

    .create-page-dropdown .modal-card-title {
        flex-shrink: unset;
        flex-grow: unset;
    }
</style>
