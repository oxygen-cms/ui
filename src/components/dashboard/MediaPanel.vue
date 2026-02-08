<template>
    <article>
        <p class="title">Photos &amp; Files <b-icon icon="photo-video" size="is-medium"></b-icon></p>
        <p class="subtitle">Photos, videos, audio, PDFs.</p>
        <div class="buttons">
            <b-button tag="router-link" to="/media/list" icon-left="list">Manage Photos & Files</b-button>
            <MediaUploadDropdown :minimal="false" :current-directory="null" @uploaded="handleUploaded" />
            <b-button tag="router-link" to="/media/responsive-images" type="is-light" icon-left="mail-bulk">Generate Responsive Images</b-button>
        </div>
    </article>
</template>

<script>
import MediaUploadDropdown from "../media/MediaUploadDropdown.vue";

export default {
    name: "MediaPanel",
    components: { MediaUploadDropdown },
    methods: {
        handleUploaded() {
            this.$router.push('/media/list');
        }
    }
}
</script>

<style scoped lang="scss">
    @import './panel.scss';
</style>