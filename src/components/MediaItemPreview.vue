<template>
    <div class="media-icon-container">
        <img v-if="item.type === TYPE_IMAGE" :src="'/content/media/' + item.filename" :alt="item.caption ? item.caption : item.name">
        <b-icon icon="file-pdf" size="is-large" class="media-icon" v-else-if="item.type === TYPE_DOCUMENT"></b-icon>
        <b-icon icon="music" size="is-large" class="media-icon" v-else-if="item.type === TYPE_AUDIO"></b-icon>
    </div>
</template>

<script>
import MediaApi from "../MediaApi";

export default {
    name: "MediaItemPreview",
    props: {
        item: Object
    },
    data() {
        return {
            TYPE_IMAGE: MediaApi.TYPE_IMAGE,
            TYPE_AUDIO: MediaApi.TYPE_AUDIO,
            TYPE_DOCUMENT: MediaApi.TYPE_DOCUMENT,
        }
    }
}
</script>

<style scoped lang="scss">
    @import './media.scss';
</style>
