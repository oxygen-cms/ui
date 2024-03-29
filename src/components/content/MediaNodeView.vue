<template>
    <NodeViewWrapper :class="{selected: isEditable && selected}">
        <MediaInsertModal :multiselect-allowed="false" :active="mediaSelectActive" @select="selectItem" @close="removeSelf"></MediaInsertModal>
        <MediaItemPreview v-if="item" :item="item">
            <b-field v-if="isEditable && selected">
                <p class="control">
                    <b-button icon-left="grip-vertical" size="is-small" data-drag-handle></b-button>
                </p>
                <p class="control">
                    <b-button size="is-small" icon-left="file-image" @click="mediaSelectActive=true"></b-button>
                </p>
                <p class="control">
                    <b-button size="is-small" icon-left="trash" @click="removeSelf"></b-button>
                </p>
            </b-field>
        </MediaItemPreview>
        <em v-else>No media item selected</em>
    </NodeViewWrapper>
</template>

<script>
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-2'
import MediaInsertModal from "../media/MediaInsertModal.vue";
import MediaItemPreview from "../media/MediaItemPreview.vue";
import MediaApi from "../../MediaApi.js";

export default {
    name: "MediaNodeView",
    components: {MediaItemPreview, MediaInsertModal, NodeViewWrapper },
    props: nodeViewProps,
    data() {
        return {
            mediaApi: new MediaApi(),
            mediaSelectActive: false,
            item: null
        }
    },
    computed: {
        isEditable() {
            return this.editor.isEditable;
        }
    },
    watch: {
        'node.attrs.id': 'fetchMediaItem'
    },
    mounted() {
        if(!this.node.attrs.id) {
            this.mediaSelectActive = true;
        }
        this.fetchMediaItem()
    },
    methods: {
        async fetchMediaItem() {
            if(!this.node.attrs.id) {
                this.item = null;
                return;
            }
            if(this.item !== null && this.item.id === this.node.attrs.id) { return; }
            console.log('fetching media item');
            this.item = (await this.mediaApi.get(this.node.attrs.id)).item;
        },
        selectItem(items) {
            console.assert(items.length === 1);
            this.updateAttributes({
                id: items[0].id
            });
            this.mediaSelectActive = false;
            this.editor.chain().focus().run();
        },
        removeSelf() {
            this.deleteNode()
            this.editor.chain().focus().insertContent({type: 'paragraph', text: ''}).run();
        }
    }
}
</script>

<style scoped lang="scss">
    @import "../../styles/_variables.scss";
    .selected {
        outline: 2px solid $danger;
    }
</style>