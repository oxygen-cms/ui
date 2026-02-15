<template>
    <div class="page-actions">
        <b-button v-if="item.stage !== STAGE_PUBLISHED" rounded size="is-small" icon-left="globe-asia" class="mr-2" @click="publish">Publish</b-button>

        <b-dropdown
            ref="moveDropdown"
            position="is-top-left"
            append-to-body
            aria-role="menu"
            trap-focus
            class="move-page-dropdown"
        >
            <template #trigger>
                <b-button rounded size="is-small" icon-left="folder-open" class="mr-2">Move</b-button>
            </template>

            <b-dropdown-item
                aria-role="menu-item"
                custom
                paddingless>
                <div class="modal-card" style="width: auto; overflow: visible">
                    <header class="modal-card-head">
                        <p class="modal-card-title">Update the parent for "{{ item.title }}"</p>
                    </header>
                    <section class="modal-card-body" style="overflow: visible;">
                        <b-field>
                            <b-autocomplete
                                v-model.lazy="movePageSearchQuery"
                                :disabled="isLoading"
                                open-on-focus
                                :data="sortedPagesList"
                                placeholder="Search for pages..."
                                clearable
                                @select="setParentPage">
                                <template #default="props">
                                    <span :style="getOptionStyle(props.option)">
                                        {{ props.option.title }} - {{ props.option.slug }}
                                        <span v-if="isCurrentParent(props.option)" style="opacity: 0.6;"> (current parent)</span>
                                    </span>
                                </template>
                                <template #empty>No results found</template>
                            </b-autocomplete>
                        </b-field>
                    </section>
                    <footer class="modal-card-foot is-flex">
                        <div class="is-flex-grow-1"></div>
                        <b-button
                            label="Close"
                            @click="close"/>
                    </footer>
                </div>
            </b-dropdown-item>
        </b-dropdown>
    </div>
</template>

<script>
import PagesApi from "../PagesApi.js";
import {morphToNotification} from "../api.js";

export default {
    name: "PageActions",
    props: {
        item: { type: Object, required: true }
    },
    data() {
        return {
            STAGE_PUBLISHED: PagesApi.STAGE_PUBLISHED,
            pagesApi: new PagesApi(),
            movePageSearchQuery: '',
            isLoading: false,
            pagesList: []
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
        'movePageSearchQuery': 'fetchData'
    },
    created() {
        this.isLoading = true;
        this.fetchData()
    },
    methods: {
        async fetchData() {
            let data = await this.pagesApi.list({ inTrash: false, page: 1, q: this.movePageSearchQuery });
            this.pagesList = data.items;
            this.isLoading = false;
        },
        async publish() {
            let item = await this.pagesApi.publish(this.item.id);
            this.$emit('update', item);
        },
        async setParentPage(parentPage) {
            // Don't allow moving to current parent
            if (this.isCurrentParent(parentPage)) {
                return;
            }
            let data = await this.pagesApi.update({id: this.item.id, parent: parentPage.id, autoConvertToDraft: 'no', version: false});
            this.$buefy.toast.open(morphToNotification(data));
            this.$emit('reload');
        },
        close() {
            this.$refs.moveDropdown.toggle();
        },
        isCurrentParent(page) {
            if (!this.item.parent) return false;
            // Handle both cases: parent as object or parent as ID
            const parentId = typeof this.item.parent === 'object' ? this.item.parent.id : this.item.parent;
            return page.id === parentId;
        },
        getOptionStyle(option) {
            let style = '';
            if (option.slug === '/') {
                style += 'font-weight: bold;';
            }
            if (this.isCurrentParent(option)) {
                style += ' opacity: 0.5; cursor: not-allowed;';
            }
            return style;
        }
    }
}
</script>

<style scoped>
    .modal-card-title {
        flex-shrink: unset;
        flex-grow: unset;
    }
</style>

<style>
    .move-page-dropdown .dropdown-content {
        padding-top: 0;
        padding-bottom: 0;
    }

    .move-page-dropdown .dropdown-menu {
        overflow: visible !important;
        min-width: 20rem;
    }
</style>