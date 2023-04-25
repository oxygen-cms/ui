<template>
    <NodeViewWrapper class="object-link">
        <b-skeleton v-if="!resolvedHref"></b-skeleton>
        <a v-else-if="!isEditable" :href="getApiHost() + resolvedHref">{{ node.attrs.content ? node.attrs.content : defaultTitle }}</a>
        <a v-else href="#" @click="onLinkClicked">{{ node.attrs.content ? node.attrs.content : defaultTitle }}</a>
        <b-modal :active="node.attrs.type === 'page' && !node.attrs.id" has-modal-card aria-modal width="80%" class="choose-page" @close="deleteNode">
            <div class="modal-card">
                <div class="modal-card-head">
                    <p class="modal-card-title">Choose a page</p>
                </div>
                <div class="modal-card-body is-flex">
                    <PageList>
                        <template #actions="props">
                            <b-button type="is-primary" @click="selectedPage(props.row)">Select</b-button>
                        </template>
                    </PageList>
                </div>
            </div>
        </b-modal>
        <MediaInsertModal :active="node.attrs.type === 'media' && !node.attrs.id" :multiselect-allowed="false" close-verb="Remove link" :action-verb="shouldReturnToEditModal ? 'Choose' : 'Insert link'" @close="deleteNode" @select="selectedMedia"></MediaInsertModal>
        <b-modal :active="editLinkModalActive" has-modal-card aria-modal @update:active="v => editLinkModalActive = v">
            <div class="modal-card">
                <div class="modal-card-head is-flex">
                    <div>
                        <p class="modal-card-title">Edit Link</p>
                    </div>
                    <div class="is-flex-grow-1"></div>
                    <b-button icon-left="trash" @click="deleteNode">Remove</b-button>
                </div>
                <div class="modal-card-body">
                    <b-field label="Title">
                        <b-input :value="node.attrs.content" :placeholder="defaultTitle" @input="v => updateAttributes({ content: v })"></b-input>
                    </b-field>
                    <div class="label">Target</div>
                    <div class="card">
                        <div class="card-content">
                            <div v-if="node.attrs.type === 'media' && resolvedObject" class="media is-align-items-center">
                                <div class="media-content">
                                    <p class="title is-4">{{ resolvedObject.name }}</p>
                                    <p class="subtitle is-6">{{ resolvedObject.fullPath }}</p>
                                </div>
                                <div class="media-right buttons">
                                    <b-button icon-left="images" @click="clearId(true)">Change...</b-button>
                                </div>
                            </div>
                            <div v-if="node.attrs.type === 'page' && resolvedObject" class="media">
                                <div class="media-icon">
                                    <b-icon icon="file-alt" size="is-large" class="mr-4 huge-icon"></b-icon>
                                </div>
                                <div class="media-content">
                                    <p class="title is-4">{{ resolvedObject.title }}</p>
                                    <p class="subtitle is-6">{{ resolvedObject.slug }}</p>
                                </div>
                                <div class="media-right buttons">
                                    <b-button icon-left="images" @click="clearId(true)">Change...</b-button>
                                </div>
                            </div>
                        </div>
                        <div v-if="node.attrs.type === 'media' && resolvedObject" class="card-image">
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
import {FetchBuilder, getApiHost} from "../../api.js";
import MediaInsertModal from "../media/MediaInsertModal.vue";
import MediaItemPreview from "../media/MediaItemPreview.vue";
import {getDirectoryPathString} from "../../MediaDirectoryApi.js";
import PageList from "../pages/PageList.vue";

export default {
    name: "ObjectLinkNodeView",
    components: {MediaInsertModal, NodeViewWrapper, MediaItemPreview, PageList },
    props: nodeViewProps,
    data() {
        return {
            getDirectoryPathString: getDirectoryPathString,
            editLinkModalActive: false,
            shouldReturnToEditModal: false,
            resolvedHref: null,
            resolvedObject: null,
            defaultTitle: '',
            getApiHost
        }
    },
    computed: {
        isEditable() {
            return this.editor.isEditable;
        }
    },
    watch: {
        'node.attrs.id': 'resolveUrl',
        'node.attrs.type': 'resolveUrl'
    },
    mounted() {
        this.resolveUrl()
    },
    methods: {
        async resolveUrl() {
            if(!this.node.attrs.id) {
                this.resolvedHref = null;
                return;
            }
            let result = await this.resolveLink({ type: this.node.attrs.type, id: this.node.attrs.id });
            console.log(result);
            // trim the leading '/' from the URL
            this.resolvedHref = result.url.substring(1);
            this.defaultTitle = result.title;
            this.resolvedObject = result.object;
        },
        async resolveLink(params) {
            return await (FetchBuilder.default(this.$buefy, 'get').withQueryParams(params).fetch(getApiRoot() + 'object-link/resolve'));
        },
        async selectedItem(info) {
            let resolved = await this.resolveLink(info);
            if(this.shouldReturnToEditModal) {
                this.editLinkModalActive = true;
            }
            this.updateAttributes({
                ...info,
                content: resolved.title
            });
        },
        async selectedPage(page) {
            return await this.selectedItem({ type: 'page', id: page.id });
        },
        async selectedMedia(items) {
            if(items.length !== 1) {
                throw new Error('expected exactly 1 item');
            }
            return await this.selectedItem({ type: 'media', id: items[0].id});
        },
        clearId(shouldReturnToEditModal) {
            this.shouldReturnToEditModal = shouldReturnToEditModal;
            this.editLinkModalActive = false;
            this.updateAttributes({
                id: null
            });
        },
        onLinkClicked() {
            this.editLinkModalActive = true
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

.choose-page ::v-deep .modal-card {
    width: 100%;
    height: 100%;
    max-width: 1600px;
}

.choose-page ::v-deep .animation-content {
    max-height: calc(100vh - 10rem);
    height: 100%;
}

::v-deep .b-skeleton {
    width: 10rem;
    margin: 0 0.5rem;
}
</style>