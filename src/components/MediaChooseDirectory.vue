<template>
    <b-dropdown
        ref="dropdown"
        position="is-top-left"
        append-to-body
        aria-role="menu"
        trap-focus
        class="choose-directory-dropdown"
    >
        <template #trigger>
            <b-button size="is-small" rounded icon-left="folder-open">
                <span v-if="buttonText">{{ buttonText }}</span>
            </b-button>
        </template>


        <b-dropdown-item
            aria-role="menu-item"
            :focusable="false"
            custom
            paddingless>
            <div class="modal-card" style="width: 30rem; overflow: visible;">
                <header class="modal-card-head">
                    <p class="modal-card-title">Choose a directory</p>
                </header>
                <section class="modal-card-body" style="overflow: visible;">
                    <b-field>
                        <b-autocomplete
                            v-model="searchQuery"
                            :disabled="isLoading"
                            open-on-focus
                            :data="filteredDirectoriesList"
                            :custom-formatter="data => getDirectoryPathString(data)"
                            placeholder="Search for directories..."
                            clearable
                            @select="selectDirectory">
                            <template #empty>No results found</template>
                        </b-autocomplete>
                    </b-field>
                </section>
                <footer class="modal-card-foot is-flex">
                    <div class="is-flex-grow-1"></div>
                    <b-button
                        label="Close"
                        @click="close"/>
                    <b-button
                        :disabled="selectedDirectory === null"
                        label="Move"
                        type="is-primary"
                        @click="submit"/>
                </footer>
            </div>
        </b-dropdown-item>
    </b-dropdown>
</template>

<script>
import MediaDirectoryApi, {getDirectoryPathString} from "../MediaDirectoryApi";

export default {
    name: "MediaChooseDirectory",
    props: {
        buttonText: {
            type: String,
            default: "Move to directory"
        }
    },
    data() {
        return {
            mediaDirectoryApi: new MediaDirectoryApi(this.$buefy),
            newDirectory: null,
            isLoading: false,
            searchQuery: '',
            directoriesList: [],
            selectedDirectory: null,
            getDirectoryPathString: getDirectoryPathString
        }
    },
    computed: {
        filteredDirectoriesList() {
            let query = this.searchQuery ? this.searchQuery.toLowerCase() : '';
            if(!query) { return this.directoriesList; }
            return this.directoriesList.filter((option) => {
                return option.name.toLowerCase().indexOf(query) >= 0
                    || option.fullPath.toLowerCase().indexOf(query) >= 0;
            })
        }
    },
    created() {
        this.fetchData()
    },
    methods: {
        async fetchData() {
            this.isLoading = true;
            let data = await this.mediaDirectoryApi.list(false, 1, null);
            this.directoriesList = data.items;
            this.directoriesList.sort((a, b) => {
                return getDirectoryPathString(a).localeCompare(getDirectoryPathString(b))
            });
            this.isLoading = false;
        },
        debounceFetchData() {
            clearTimeout(this.searchDebounce)
            this.searchDebounce = setTimeout(() => {
                this.fetchData();
            }, 400);
        },
        submit() {
            this.$emit('submit', this.selectedDirectory);
            this.close();
        },
        selectDirectory(option) {
            this.selectedDirectory = option;
        },
        close() {
            this.selectedDirectory = null;
            this.searchQuery = '';
            this.$refs.dropdown.toggle();
        }
    }
}
</script>

<style>
    .dropdown-content {
        padding-top: 0;
        padding-bottom: 0;
    }
</style>
