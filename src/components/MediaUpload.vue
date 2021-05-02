<template>
    <div class="modal-card">
        <header class="modal-card-head">
            <p class="modal-card-title" v-if="!isUploading">Upload files to '{{ currentPath }}'</p>
            <p class="modal-card-title" v-else>Uploading {{ filesToUpload.length }} item(s)</p>
        </header>
        <section class="modal-card-body" v-if="!isUploading">
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
        <section v-else class="modal-card-body">
            <b-progress size="is-medium" type="is-info"></b-progress>
        </section>
        <footer class="modal-card-foot is-flex">
            <div class="is-flex-grow-1"></div>
            <b-button @click="closeModal">Close</b-button>
            <b-button @click="doUpload" type="is-primary" :disabled="isUploading">Upload</b-button>
        </footer>
    </div>
</template>

<script>
import {morphToNotification} from "../api";
import MediaApi from "../MediaApi";
import {getDirectoryPathString} from "../MediaDirectoryApi";

export default {
    name: "MediaUpload.vue",
    props: {
        currentDirectory: Object
    },
    data() {
        return {
            filesToUpload: [],
            isUploading: false,
            mediaApi: new MediaApi(this.$buefy)
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
                return new Promise((resolve, reject) => {
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
                this.closeModal();
            } catch(e) {
                // upload failed
                console.warn(e);
                this.closeModal();
            }
        },
        closeModal() {
            this.isUploading = false;
            this.filesToUpload = [];
            this.$emit('close');
        }
    }
}
</script>

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
