<template>
    <div class="media-item card" :class="directory.selected ? 'media-item-selected' : ''">
        <div class="card-image media-icon-container cursor-pointer" @click.exact="select(true)" @click.shift.exact="select(false)">
            <b-icon icon="folder" size="is-large" class="media-icon"></b-icon>
        </div>
        <div class="card-content">
            <p class="title is-4 cursor-pointer has-text-centered" @click.exact="select(true)" @click.shift.exact="select(false)">{{ directory.name }}</p>
            <p class="subtitle is-6 cursor-pointer has-text-centered" v-if="displayFullPath" @click.exact="select(true)" @click.shift.exact="select(false)">inside '{{ directoryPath }}'</p>
            <div v-if="directory.selected" class="content media-item-toolbar">
                <b-button v-if="directory.selected" icon-left="pencil-alt" size="is-small" rounded @click.stop="renameDirectory">Rename</b-button>
                <MediaChooseDirectory v-if="directory.selected" @submit="moveToDirectory" button-text="Move">
                </MediaChooseDirectory>
                <b-button v-if="directory.selected" icon-left="trash" size="is-small" type="is-danger" rounded outlined @click.stop="confirmDeleteDirectory">Delete</b-button>
            </div>
        </div>

        <b-modal :active.sync="isEditModalActive" trap-focus has-modal-card width="80%">
            <div class="modal-card" style="width: auto">
                <header class="modal-card-head">
                    <p class="modal-card-title">Rename Directory</p>
                </header>
                <section class="modal-card-body">
                    <b-field label="Name" label-position="inside">
                        <b-input v-model="newName"></b-input>
                    </b-field>
                    <b-field label="Slug" label-position="inside">
                        <b-input v-model="newSlug"></b-input>
                    </b-field>
                </section>
                <footer class="modal-card-foot is-flex">
                    <div class="is-flex-grow-1"></div>
                    <b-button @click="isEditModalActive = false">Cancel</b-button>
                    <b-button @click="doRenameDirectory" type="is-primary">Rename</b-button>
                </footer>
            </div>
        </b-modal>

        <!--                <b-button type="is-light" expanded @click="currentPath = dir.fullPath"></b-button>-->
    </div>

</template>

<script>
import MediaDirectoryApi, {getDirectoryPathString} from "../MediaDirectoryApi";
import {morphToNotification} from "../api";
import MediaChooseDirectory from "./MediaChooseDirectory.vue";

export default {
    name: "MediaDirectory.vue",
    props: {
        directory: Object,
        displayFullPath: Boolean
    },
    data() {
        return {
            isEditModalActive: false,
            newName: '',
            newSlug: '',
            mediaDirectoryApi: new MediaDirectoryApi(this.$buefy)
        }
    },
    computed: {
        directoryPath() {
            return getDirectoryPathString(this.directory.parentDirectory);
        }
    },
    components: { MediaChooseDirectory },
    methods: {
        select(toggle) {
            // if already selected, then navigate into a directory
            if(this.directory.selected) {
                this.$emit('navigate', { currentPath: this.directory.fullPath })
                return;
            }
            this.$emit('select', this.directory, toggle);
        },
        renameDirectory() {
            this.newName = this.directory.name;
            this.newSlug = this.directory.slug;
            this.isEditModalActive = true;
        },
        doRenameDirectory() {
            this.$emit('rename', this.directory, this.newName);
            this.isRenaming = false;
        },
        async confirmDeleteDirectory() {
            await this.mediaDirectoryApi.confirmForceDelete(this.directory.id);
            this.$emit('delete');
        },
        async moveToDirectory(directory) {
            console.log('move to directory', directory);
            let data = await this.mediaDirectoryApi.update({
                id: this.directory.id,
                parentDirectory: directory
            });
            this.$buefy.toast.open(morphToNotification(data));
            this.$emit('move', this.directory);
        }
    }
}
</script>

<style scoped lang="scss">
    @import "./media.scss";

    .media-item-selected .title {
        margin-bottom: 1.5rem;
    }
</style>
