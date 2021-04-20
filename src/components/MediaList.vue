<template>

    <div class="full-height full-height-container media-container">
        <div class="top-bar">
            <div class="breadcrumb" v-if="!paginatedItems.loading && !inTrash && !searchQuery">
                <ul>
                    <li v-for="item in getDirectoryBreadcrumbItems(paginatedItems.currentDirectory)" :class="item.separator ? 'separator' : ''">
                        <b-icon v-if="item.home && paginatedItems.currentDirectory === null" class="subtitle" icon="home"></b-icon>
                        <b-button v-else-if="item.home" type="is-text" @click="navigateTo({ path: '' })" class="subtitle" icon-left="home"></b-button>
                        <b-button v-else-if="item.link !== null" type="is-text" @click="navigateTo({ path: item.link })" class="subtitle">{{ item.text }}</b-button>
                        <span v-else class="subtitle is-active">{{ item.text }}</span>
                    </li>
                </ul>
            </div>
            <div v-else-if="inTrash" class="is-flex">
                <b-button @click="navigateTo({ path: '' })" outlined rounded icon-left="arrow-left" class="action-bar-pad">All Items</b-button>
                <div class="title action-bar-pad">Deleted Photos & Files</div>
            </div>
            <div v-else-if="searchQuery" class="is-flex">
                <b-button @click="navigateTo({ path: '' })" outlined rounded icon-left="arrow-left" class="action-bar-pad">All Items</b-button>
                <div class="title action-bar-pad">Search results for "{{ searchQuery }}"</div>
            </div>
            <ul v-else>
                <li><b-skeleton :animated="true" size="is-large" :width="100"></b-skeleton></li>
            </ul>

            <div class="is-flex-grow-1"></div>
            <b-button v-if="!inTrash && !searchQuery" icon-left="folder-plus" @click="isCreateDirectoryModalActive = true" class="action-bar-pad">New Directory</b-button>
            <b-button v-if="!inTrash && !searchQuery" icon-left="file-upload" @click="isUploadModalActive = true" type="is-success" class="action-bar-pad">Upload Files</b-button>
            <b-input rounded placeholder="Search photos and files..." icon="search" icon-pack="fas"
                     :value="searchQuery" @input="value => navigateTo({searchQuery: value})" class="action-bar-pad" v-if="!inTrash"></b-input>
            <b-button v-if="!inTrash" icon-left="trash" @click="navigateTo({inTrash: true})" type="is-danger" outlined class="action-bar-pad">View Trash</b-button>
            <b-field class="action-bar-pad">
                <p class="control">
                    <b-button disabled v-if="numberOfItemsSelected > 0" type="is-primary">{{ numberOfItemsSelected }} item(s) selected</b-button>
                </p>
                <p class="control">
                    <b-button v-if="numberOfItemsSelected > 0" @click="resetSelection" icon-left="times" type="is-primary"></b-button>
                </p>
            </b-field>
        </div>


        <div class="media-items full-height-flex scroll-container">

            <b-loading :is-full-page="false" v-model="paginatedItems.loading" :can-cancel="false"></b-loading>

            <h2 class="subtitle media-items-empty" v-if="!paginatedItems.loading && paginatedItems.directories.length === 0 && paginatedItems.files.length === 0">
                No items found.
            </h2>

            <MediaDirectory
                v-for="dir in paginatedItems.directories"
                :key="dir.id"
                :directory="dir"
                @rename="renameDirectory"
                @move="fetchData"
                @delete="fetchData"
                @select="(item, toggle) => handleSelect(paginatedItems.directories, item, toggle)"
                @navigate="navigateTo"></MediaDirectory>
            <MediaItem
                v-for="item in paginatedItems.files"
                :key="item.id"
                :item="item"
                :double-click-action="doubleClickAction"
                @update:item="fetchData"
                @select="(i, toggle) => handleSelect(paginatedItems.files, i, toggle)"></MediaItem>

        </div>

        <b-modal :active.sync="isCreateDirectoryModalActive" trap-focus has-modal-card aria-role="dialog" aria-modal auto-focus>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">Create directory inside of '{{ currentPathDisplay }}'</p>
                </header>
                <section class="modal-card-body">
                    <b-field label-position="inside" label="Name">
                        <b-input v-model="newDirectoryName"></b-input>
                    </b-field>
                </section>
                <footer class="modal-card-foot is-flex">
                    <div class="is-flex-grow-1"></div>
                    <b-button @click="isCreateDirectoryModalActive = false">Close</b-button>
                    <b-button @click="doCreateDirectory" type="is-primary">Create</b-button>
                </footer>
            </div>
        </b-modal>

        <b-modal :active.sync="isUploadModalActive" trap-focus has-modal-card aria-role="dialog" aria-modal auto-focus>
            <MediaUpload :current-directory="paginatedItems.currentDirectory" @close="isUploadModalActive = false" @uploaded="fetchData"></MediaUpload>
        </b-modal>

    </div>

</template>

<script>
import MediaApi from "../MediaApi";
import MediaDirectory from "./MediaDirectory.vue";
import MediaItem from "./MediaItem.vue";
import MediaDirectoryApi, {getDirectoryBreadcrumbItems, getDirectoryPathString} from "../MediaDirectoryApi";
import {morphToNotification} from "../api";
import MediaUpload from "./MediaUpload.vue";

export default {
    name: "MediaList",
    props: {
        currentPath: {
            type: String
        },
        inTrash: {
            type: Boolean
        },
        searchQuery: {
            type: String
        },
        doubleClickAction: {
            type: Function,
            default: null
        }
    },
    watch: {
        'searchQuery': 'debounceFetchData',
        'inTrash': 'fetchData',
        'currentPath': 'fetchData'
    },
    data() {
        return {
            paginatedItems: {files: [], directories: [], currentDirectory: null, totalFiles: null, filesPerPage: null, loading: false, currentPage: 1},
            isCreateDirectoryModalActive: false,
            isUploadModalActive: false,
            newDirectoryName: '',
            searchDebounce: null,
            mediaApi: new MediaApi(this.$buefy),
            mediaDirectoryApi: new MediaDirectoryApi(this.$buefy),
            getDirectoryBreadcrumbItems: getDirectoryBreadcrumbItems
        }
    },
    components: { MediaDirectory, MediaItem, MediaUpload },
    created() {
        this.fetchData()
    },
    computed: {
        currentPathDisplay() {
            return getDirectoryPathString(this.paginatedItems.currentDirectory);
        },
        numberOfItemsSelected() {
            return this.paginatedItems.files.concat(this.paginatedItems.directories).filter(item => item.selected).length;
        }
    },
    methods: {
        async fetchData() {
            if(this.paginatedItems.loading) {
                return;
            }
            this.paginatedItems.loading = true;
            this.paginatedItems.files = []
            this.paginatedItems.directories = [];

            let data = await this.mediaApi.list(this.inTrash, this.searchQuery, this.paginatedItems.currentPage, this.searchQuery ? '' : this.currentPath);

            this.paginatedItems.currentDirectory = data.currentDirectory;
            this.paginatedItems.directories = data.directories.map(dir => { dir.selected = false; return dir; });
            this.paginatedItems.files = data.files.map(file => {file.selected = false; return file;});
            this.paginatedItems.totalItems = data.totalFiles;
            this.paginatedItems.filesPerPage = data.filesPerPage;
            this.paginatedItems.loading = false;
        },
        debounceFetchData() {
            clearTimeout(this.searchDebounce)
            this.searchDebounce = setTimeout(() => {
                this.fetchData();
            }, 400);
        },
        handleSelect(items, item, toggle) {
            this.paginatedItems.files.concat(this.paginatedItems.directories)
                .forEach(i => {
                    if(i === item && toggle) {
                        i.selected = !i.selected;
                    } else if(i === item) {
                        i.selected = true;
                    } else if(toggle) {
                        i.selected = false;
                    }
                });
            this.$emit('select-files', this.paginatedItems.files.filter(i => i.selected));
        },
        resetSelection() {
            console.log('resetting selection');
            this.paginatedItems.files.concat(this.paginatedItems.directories)
                .forEach(i => i.selected = false);
        },
        navigateTo(options) {
            this.$emit('navigate', options);
        },
        async doCreateDirectory() {
            let data = await this.mediaDirectoryApi.create({
                name: this.newDirectoryName,
                parentDirectory: this.paginatedItems.currentDirectory !== null ? this.paginatedItems.currentDirectory.id : null
            });
            this.$buefy.toast.open(morphToNotification(data));
            this.newDirectoryName = '';
            this.isCreateDirectoryModalActive = false;
            await this.fetchData();
        },
        async renameDirectory(dir, name) {
            let data = await this.mediaDirectoryApi.update({ ... dir, name: name });
            this.$buefy.toast.open(morphToNotification(data));
            await this.fetchData();
        },
    }
}
</script>

<style scoped lang="scss">
    @import '../styles/_variables.scss';
    @import './util.css';

    .box {
        display: flex;
        flex-direction: column;
        padding: 0;
    }

    .media-items {
        position: relative;
        flex: 1;
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        align-content: flex-start;
        padding: 1rem;
    }

    .media-container {
        background-color: $white-bis;
    }

    .top-bar {
        display: flex;
        align-items: center;
        background-color: white;
        padding: 1rem;
        margin-bottom: 0;
        border-bottom: 1px solid #ccc;
        width: 100%;
        position: sticky;
        top: 0;
        z-index: 1;
    }

    .top-bar .breadcrumb {
        margin-bottom: 0;
    }

    .action-bar-pad {
        margin: 0 0.25rem;
    }

    .breadcrumb li {
        padding: 0 0.5em;
    }

    .breadcrumb li:first-child a {
        padding-left: inherit !important;
    }

    .breadcrumb li + li:before {
        padding-right: 1.5em;
    }

    .breadcrumb ul {
        align-items: center;
    }

    .media-items-empty {
        text-align: center;
        padding: 3rem 1rem;
        width: 100%;
    }
</style>
