<template>
    <div class="media-icon-container">
        <img v-if="item.type === TYPE_IMAGE && !loadingError" :src="getApiHost() + 'content/media/' + item.filename" :alt="item.caption ? item.caption : item.name" @error="loadingFailed">
        <b-tooltip v-else-if="item.type === TYPE_IMAGE" :label="missingMessage" type="is-dark" position="is-bottom" multilined>
            <b-icon type="is-danger" icon="file-image" size="is-large" class="media-icon"></b-icon>
        </b-tooltip>
        <img v-if="item.type === TYPE_DOCUMENT && !loadingError" :src="getApiRoot() + 'media/' + item.id + '/preview'" alt="PDF preview" @error="loadingFailed">
        <b-tooltip v-else-if="item.type === TYPE_DOCUMENT" :label="missingMessage" type="is-dark" position="is-bottom" multilined>
            <b-icon type="is-danger" icon="file-pdf" size="is-large" class="media-icon"></b-icon>
        </b-tooltip>
        <b-icon v-else-if="item.type === TYPE_AUDIO" icon="music" size="is-large" class="media-icon"></b-icon>
        <div class="media-icon-toolbar"><slot></slot></div>
    </div>
</template>

<script>
import MediaApi from "../../MediaApi";
import {getApiRoot} from "../../CrudApi.js";
import {getApiHost} from "../../api.js";

export default {
    name: "MediaItemPreview",
    props: {
        item: { type: Object, required: true },
        missingMessage: {
            type: String,
            default: 'There was an error trying to load this media item. The file may be corrupt or missing'
        }
    },
    watch: { 'item': 'resetLoadingFailed' },
    data() {
        return {
            getApiHost: getApiHost,
            getApiRoot: getApiRoot,
            TYPE_IMAGE: MediaApi.TYPE_IMAGE,
            TYPE_AUDIO: MediaApi.TYPE_AUDIO,
            TYPE_DOCUMENT: MediaApi.TYPE_DOCUMENT,
            loadingError: false
        }
    },
    methods: {
        resetLoadingFailed() {
            this.loadingError = false;
        },
        loadingFailed() {
            this.loadingError = true;
        }
    }
}
</script>

<style scoped lang="scss">
    @import './media.scss';

    .media-icon-toolbar {
        z-index: 10;
        position: absolute;
        top: 1rem;
        right: 1rem;
    }
</style>
