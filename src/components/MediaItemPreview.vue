<template>
    <div class="media-icon-container">
        <img v-if="item.type === TYPE_IMAGE && !loadingError" :src="'/content/media/' + item.filename" :alt="item.caption ? item.caption : item.name" @error="loadingFailed">
        <b-tooltip :label="missingMessage" type="is-dark" position="is-bottom" multilined v-else-if="item.type === TYPE_IMAGE">
            <b-icon type="is-danger" icon="file-image" size="is-large" class="media-icon"></b-icon>
        </b-tooltip>
        <img v-if="item.type === TYPE_DOCUMENT && !loadingError" :src="'/oxygen/api/media/' + item.id + '/preview'" alt="PDF preview" @error="loadingFailed">
        <b-tooltip :label="missingMessage" type="is-dark" position="is-bottom" multilined v-else-if="item.type === TYPE_DOCUMENT">
            <b-icon type="is-danger" icon="file-pdf" size="is-large" class="media-icon"></b-icon>
        </b-tooltip>
        <b-icon icon="music" size="is-large" class="media-icon" v-else-if="item.type === TYPE_AUDIO"></b-icon>
    </div>
</template>

<script>
import MediaApi from "../MediaApi";

export default {
    name: "MediaItemPreview",
    props: {
        item: Object,
        missingMessage: {
            type: String,
            default: 'There was an error trying to load this media item. The file may be corrupt or missing'
        }
    },
    data() {
        return {
            TYPE_IMAGE: MediaApi.TYPE_IMAGE,
            TYPE_AUDIO: MediaApi.TYPE_AUDIO,
            TYPE_DOCUMENT: MediaApi.TYPE_DOCUMENT,
            loadingError: false
        }
    },
    methods: {
        loadingFailed() {
            this.loadingError = true;
        }
    }
}
</script>

<style scoped lang="scss">
    @import './media.scss';
</style>
