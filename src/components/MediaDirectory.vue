<template>
    <div class="media-item card" :class="directory.selected ? 'media-item-selected' : ''">
        <div class="card-image media-icon-container cursor-pointer" @click.exact="select(true)" @click.shift.exact="select(false)">
            <b-icon icon="folder" size="is-large" class="media-icon"></b-icon>
        </div>
        <div class="card-content">
            <div v-if="!isRenaming" class="is-flex action-bar">
                <span class="title is-4 cursor-pointer" @click.exact="select(true)" @click.shift.exact="select(false)">{{ directory.name }}</span>
                <span class="is-flex-grow-1"></span>
                <b-button v-if="directory.selected" icon-left="pencil-alt" size="is-small" rounded @click.stop="renameDirectory"></b-button>
                <MediaChooseDirectory v-if="directory.selected" @submit="moveToDirectory"></MediaChooseDirectory>
                <b-button v-if="directory.selected && !isRenaming" icon-left="trash" size="is-small" type="is-danger" rounded outlined @click.stop="confirmDeleteDirectory"></b-button>
            </div>
            <b-field custom-class="is-small" v-else>
                <b-input size="is-small" v-model="newName"></b-input>
                <p class="control">
                    <b-button @click="doRenameDirectory" size="is-small" type="is-primary">Rename</b-button>
                </p>
            </b-field>
        </div>

        <!--                <b-button type="is-light" expanded @click="currentPath = dir.fullPath"></b-button>-->
    </div>

</template>

<script>
import MediaDirectoryApi from "../MediaDirectoryApi";
import {morphToNotification} from "../api";

export default {
    name: "MediaDirectory.vue",
    props: {
        directory: Object
    },
    data() {
        return {
            isRenaming: false,
            newName: '',
            mediaDirectoryApi: new MediaDirectoryApi(this.$buefy)
        }
    },
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
            this.isRenaming = true
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
            if(this.item.id === directory.id) {
                this.$buefy.dialog.alert({
                    title: "Unable to move directory",
                    message: "A directory cannot be it's own parent.",
                    type: 'is-danger'
                });
                return;
            }
            let data = await this.mediaDirectoryApi.update({
                id: this.item.id,
                parentDirectory: directory.id
            });
            this.$buefy.toast.open(morphToNotification(data));
            this.$emit('move', this.item);
        }
    }
}
</script>

<style scoped lang="scss">
    @import "./media.scss";

    .action-bar button {
        margin: 0 0.25rem;
    }

    .action-bar .title {
        margin-bottom: 0;
    }
</style>
