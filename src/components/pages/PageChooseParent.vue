<template>
    <div class="page-choose-parent">
        <b-field v-if="label" :label="label">
            <b-autocomplete
                v-model="searchQuery"
                :key="autocompleteKey"
                :disabled="isLoading || loadingCurrentParent"
                open-on-focus
                :data="sortedPagesList"
                :placeholder="placeholder"
                clearable
                @select="onSelect">
                <template #default="props">
                    <span :style="getOptionStyle(props.option)">
                        {{ props.option.title }} - {{ props.option.slug }}
                        <span v-if="isCurrentParent(props.option)" style="opacity: 0.6;"> (current parent)</span>
                    </span>
                </template>
                <template #empty>No results found</template>
            </b-autocomplete>
        </b-field>
        <b-autocomplete
            v-else
            v-model="searchQuery"
            :key="autocompleteKey"
            :disabled="isLoading || loadingCurrentParent"
            open-on-focus
            :data="sortedPagesList"
            :placeholder="placeholder"
            clearable
            @select="onSelect">
            <template #default="props">
                <span :style="getOptionStyle(props.option)">
                    {{ props.option.title }} - {{ props.option.slug }}
                    <span v-if="isCurrentParent(props.option)" style="opacity: 0.6;"> (current parent)</span>
                </span>
            </template>
            <template #empty>No results found</template>
        </b-autocomplete>
    </div>
</template>

<script>
import PagesApi from "../../PagesApi.js";

export default {
    name: "PageChooseParent",
    props: {
        currentParentId: {
            type: Number,
            default: null
        },
        label: {
            type: String,
            default: ''
        },
        excludePageId: {
            type: Number,
            default: null  // Don't allow selecting this page (e.g., can't move page to itself)
        },
        showSlug: {
            type: Boolean,
            default: false  // If true, show slug in placeholder; otherwise show title
        }
    },
    data() {
        return {
            pagesApi: new PagesApi(),
            searchQuery: '',
            isLoading: false,
            pagesList: [],
            autocompleteKey: 0,  // Force re-render after selection
            currentParentPage: null,
            loadingCurrentParent: false
        }
    },
    computed: {
        sortedPagesList() {
            // Sort with Home page (slug '/') at the top, then alphabetically by title
            // Also filter out the excluded page
            return [...this.pagesList]
                .filter(page => !this.excludePageId || page.id !== this.excludePageId)
                .sort((a, b) => {
                    if (a.slug === '/') return -1;
                    if (b.slug === '/') return 1;
                    return a.title.localeCompare(b.title);
                });
        },
        placeholder() {
            if (this.loadingCurrentParent) {
                return '';
            }
            if (this.currentParentPage) {
                if (this.showSlug) {
                    // For PageEdit - show slug, and (root) for root pages
                    return this.currentParentPage.slug === '/' ? '(root)' : this.currentParentPage.slug;
                } else {
                    // For PageActions - show title
                    return this.currentParentPage.title;
                }
            }
            return this.showSlug ? '(root)' : '(root)';
        }
    },
    watch: {
        'searchQuery': 'fetchData',
        'currentParentId': {
            immediate: true,
            handler(newId) {
                this.loadCurrentParent(newId);
            }
        }
    },
    created() {
        this.isLoading = true;
        this.fetchData();
    },
    methods: {
        async fetchData() {
            let data = await this.pagesApi.list({ inTrash: false, page: 1, q: this.searchQuery });
            this.pagesList = data.items;
            this.isLoading = false;
        },
        async loadCurrentParent(parentId) {
            if (!parentId || typeof parentId !== 'number') {
                this.currentParentPage = null;
                this.loadingCurrentParent = false;
                return;
            }

            this.loadingCurrentParent = true;
            try {
                const response = await this.pagesApi.get(parentId);
                this.currentParentPage = response.data || response.item;
            } catch (error) {
                console.error('Failed to load current parent page:', error);
                this.currentParentPage = null;
            } finally {
                this.loadingCurrentParent = false;
            }
        },
        onSelect(parentPage) {
            // Don't allow selecting current parent
            if (this.isCurrentParent(parentPage)) {
                return;
            }

            this.$emit('select', parentPage);

            // Clear search query and force re-render of autocomplete
            this.searchQuery = '';
            this.autocompleteKey++;
        },
        isCurrentParent(page) {
            if (!this.currentParentId) return false;
            return page.id === this.currentParentId;
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
