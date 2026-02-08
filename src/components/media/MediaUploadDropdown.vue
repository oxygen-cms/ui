<template>
    <b-dropdown
        ref="dropdown"
        :position="minimal ? 'is-bottom-right' : 'is-bottom-left'"
        aria-role="menu"
        trap-focus
        append-to-body
        class="media-upload-dropdown">
        <template #trigger="{ active }">
            <MinimalDropdownButton v-if="minimal" icon="upload"/>
            <b-button v-else
                      :type="active ? '' : 'is-success'"
                      icon-left="file-upload"
                      :disabled="active">
                Upload Files
            </b-button>
        </template>

        <b-dropdown-item aria-role="menu-item" custom paddingless>
            <div class="modal-card" style="width: auto; overflow: visible">
                <header class="modal-card-head has-background-success-light">
                    <p v-if="!isUploading" class="modal-card-title">
                        <b-icon icon="upload" size="is-normal" class="push-right"></b-icon>
                        Upload files to '{{ currentPath }}'
                    </p>
                    <p v-else class="modal-card-title">
                        <b-icon icon="upload" size="is-normal" class="push-right"></b-icon>
                        Uploading {{ filesToUpload.length }} item(s)
                    </p>
                </header>
                <section v-if="!isUploading" class="modal-card-body" style="overflow: visible;">
                    <b-upload v-model="filesToUpload"
                              multiple
                              drag-drop expanded>
                        <section class="section">
                            <div class="content has-text-centered">
                                <p>
                                    <b-icon
                                        icon="upload"
                                        size="is-large">
                                    </b-icon>
                                </p>
                                <p>Drop your files here or click to upload</p>
                            </div>
                        </section>
                    </b-upload>

                    <div class="tags mt-4">
                        <span v-for="(file, index) in filesToUpload" :key="index" class="tag is-primary image-preview">
                            <img :src="imagePreviews[index]" alt="file preview" />
                            <p class="image-preview-label">
                                {{ file.name }}
                                <button class="delete is-small" type="button" @click="deleteFileToUpload(index)"></button>
                            </p>
                        </span>
                    </div>
                </section>
                <section v-else class="modal-card-body" style="overflow: visible;">
                    <b-progress size="is-medium" type="is-info"></b-progress>
                </section>
                <footer class="modal-card-foot is-flex">
                    <div class="is-flex-grow-1"></div>
                    <b-button @click="close">Close</b-button>
                    <b-button type="is-success" :disabled="isUploading" @click="doUpload">Upload</b-button>
                </footer>
            </div>
        </b-dropdown-item>
    </b-dropdown>
</template>

<script>
import {morphToNotification} from "../../api";
import MediaApi from "../../MediaApi";
import {getDirectoryPathString} from "../../MediaDirectoryApi";
import MinimalDropdownButton from "../MinimalDropdownButton.vue";

export default {
    name: "MediaUploadDropdown",
    components: { MinimalDropdownButton },
    props: {
        currentDirectory: { type: Object, default: null },
        minimal: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            filesToUpload: [],
            isUploading: false,
            mediaApi: new MediaApi()
        }
    },
    computed: {
        currentPath() {
            return getDirectoryPathString(this.currentDirectory);
        },
    },
    asyncComputed: {
        async imagePreviews() {
            let promises = this.filesToUpload.map(file => {
                return new Promise((resolve) => {
                    let reader = new FileReader();
                    reader.onload = function (e) {
                        resolve(e.target.result);
                    };
                    reader.readAsDataURL(file);
                })
            })
            return Promise.all(promises);
        }
    },
    methods: {
        deleteFileToUpload(index) {
            this.filesToUpload.splice(index, 1);
        },
        async doUpload() {
            if(this.filesToUpload.length === 0) {
                return this.$buefy.toast.open({
                    message: 'No files selected for upload',
                    type: 'is-warning',
                    queue: false
                });
            }
            this.isUploading = true;
            try {
                let data = await this.mediaApi.create({
                    files: this.filesToUpload,
                    currentDirectory: this.currentDirectory
                });
                this.$buefy.toast.open(morphToNotification(data));
                this.$emit('uploaded');
                this.close();
            } catch(e) {
                // upload failed
                console.warn(e);
                this.close();
            }
        },
        close() {
            this.$refs.dropdown.toggle();
            this.isUploading = false;
            this.filesToUpload = [];
        }
    }
}
</script>

<style>
    .media-upload-dropdown .dropdown-content {
        padding-top: 0;
        padding-bottom: 0;
    }

    .media-upload-dropdown .dropdown-menu {
        overflow: visible !important;
        min-width: 30rem;
    }

    .media-upload-dropdown .modal-card-title {
        flex-shrink: unset;
        flex-grow: unset;
    }
</style>

<style scoped>
    .image-preview {
        display: flex;
        flex-direction: column;
        height: auto;
    }

    .image-preview img {
        margin: 0.5rem;
    }

    .image-preview-label {
        margin: 0.5rem;
        display: inline-flex;
        align-items: center;
    }
</style>
