<template>
    <NodeViewWrapper class="object-link">
        <b-skeleton v-if="!resolvedHref" width="10rem" class="loading-skeleton"></b-skeleton>
        <a v-else href="#" @click="editLinkModalActive = true">{{ node.attrs.content ? node.attrs.content : defaultTitle }}</a>
        <b-modal :active="node.attrs.type === 'page' && !node.attrs.id" has-modal-card @close="deleteNode" aria-modal>
            <div class="modal-card">
                <div class="modal-card-body">
                    choose a page to insert!!
                </div>
            </div>
        </b-modal>
        <MediaInsertModal :active="node.attrs.type === 'media' && !node.attrs.id" :multiselect-allowed="false" @close="deleteNode" @select="selectedMedia" close-verb="Remove link" :action-verb="shouldReturnToEditModal ? 'Choose' : 'Insert link'"></MediaInsertModal>
        <b-modal :active="editLinkModalActive" @update:active="v => editLinkModalActive = v" has-modal-card aria-modal>
            <div class="modal-card">
                <div class="modal-card-head">
                    <p class="modal-card-title">Edit Link</p>
                </div>
                <div class="modal-card-body">
                    <b-field label="Title">
                        <b-input :value="node.attrs.content" @input="v => updateAttributes({ content: v })" :placeholder="defaultTitle"></b-input>
                    </b-field>
                    <div class="label">Target</div>
                    <div class="card">
                        <div class="card-content">
                            <div class="media is-align-items-center" v-if="node.attrs.type === 'media' && resolvedObject">
                                <div class="media-content">
                                    <p class="title is-4">{{ resolvedObject.name }}</p>
                                    <p class="subtitle is-6">{{ resolvedObject.fullPath }}</p>
                                </div>
                                <div class="media-right buttons">
                                    <b-button icon-left="images" @click="clearId(true)">Change...</b-button>
                                    <b-button icon-left="trash" @click="deleteNode">Remove</b-button>
                                </div>
                            </div>
                            <div class="media" v-if="node.attrs.type === 'page' && resolvedObject">
                                <div class="media-icon">
                                    <b-icon icon="file-alt" size="is-large" class="mr-4 huge-icon"></b-icon>
                                </div>
                                <div class="media-content">
                                    <p class="title is-4">{{ resolvedObject.title }}</p>
                                    <p class="subtitle is-6">{{ resolvedObject.slug }}</p>
                                </div>
                                <div class="media-right buttons">
                                    <b-button icon-left="images" @click="clearId(true)">Change...</b-button>
                                    <b-button icon-left="trash" @click="deleteNode">Remove</b-button>
                                </div>
                            </div>
                        </div>
                        <div class="card-image" v-if="node.attrs.type === 'media' && resolvedObject">
                            <MediaItemPreview :item="resolvedObject" />
                        </div>
                    </div>
<!--                    <b-button @click="clearId">Select different object...</b-button>-->
                </div>
            </div>
        </b-modal>
    </NodeViewWrapper>
</template>

<script>
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-2'
import {getApiRoot} from "../../CrudApi.js";
import {FetchBuilder} from "../../api.js";
import MediaInsertModal from "../media/MediaInsertModal.vue";
import MediaItemPreview from "../media/MediaItemPreview.vue";
import {getDirectoryPathString} from "../../MediaDirectoryApi.js";

export default {
    name: "ObjectLinkNodeView",
    components: {MediaInsertModal, NodeViewWrapper, MediaItemPreview },
    props: nodeViewProps,
    data() {
        return {
            getDirectoryPathString: getDirectoryPathString,
            editLinkModalActive: false,
            shouldReturnToEditModal: false,
            resolvedHref: null,
            resolvedObject: null,
            defaultTitle: ''
        }
    },
    computed: {
        isEditable() {
            return this.editor.isEditable;
        }
    },
    mounted() {
        this.resolveUrl()
    },
    watch: {
        'node.attrs.id': 'resolveUrl',
        'node.attrs.type': 'resolveUrl'
    },
    methods: {
        async resolveUrl() {
            if(!this.node.attrs.id) {
                this.resolvedHref = null;
                return;
            }
            let result = await this.resolveLink({ type: this.node.attrs.type, id: this.node.attrs.id });
            console.log(result);
            this.resolvedHref = result.url;
            this.defaultTitle = result.title;
            this.resolvedObject = result.object;
        },
        async resolveLink(params) {
            return await (FetchBuilder.default(this.$buefy, 'get').withQueryParams(params).fetch(getApiRoot() + 'object-link/resolve'));
        },
        async selectedMedia(items) {
            if(items.length !== 1) {
                throw new Exception('expected exactly 1 item');
            }
            let info = { type: 'media', id: items[0].id};
            let resolved = await this.resolveLink(info);
            if(this.shouldReturnToEditModal) {
                this.editLinkModalActive = true;
            }
            this.updateAttributes({
                ...info,
                content: resolved.title
            });
        },
        clearId(shouldReturnToEditModal) {
            this.shouldReturnToEditModal = shouldReturnToEditModal;
            this.editLinkModalActive = false;
            this.updateAttributes({
                id: null
            });
        }
    }
}
</script>

<style scoped>
.object-link {
    display: inline;
}

.media-icon ::v-deep .huge-icon {
    width: 6rem;
    height: 6rem;
    font-size: 300%;
}
</style>

<style>
.object-link > .b-skeleton {
    width: 10rem;
}
</style>