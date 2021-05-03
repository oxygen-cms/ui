<template>
    <div class="full-height full-height-container pad">
        <h1 class="title">Responsive Images Support</h1>

        <div class="box full-height-container full-height-flex" style="min-height: 0">
            <div class="content" style="max-width: 80rem;">
            <p><a href="https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images">Responsive images</a> are images which work well on devices of differing screen sizes, resolutions etc...
                Depending on the size/pixel density of the users' screen, we serve a different image to them. This optimization helps speed up load times dramatically.</p>
            <b-button type="is-primary" @click="generate" :disabled="requestInFlight">Generate responsive versions for each image</b-button>
            </div>
            <b-progress v-if="requestInFlight" size="is-medium" show-value>Generating...</b-progress>
            <div v-if="hasServerLog" class="full-height-flex full-height-container" style="min-height: 0;">
                <h4 class="subtitle">Server output log:</h4>
                <pre v-html="serverLog" class="scroll-container full-height-flex" style="background-color: #000;"></pre>
            </div>
        </div>
    </div>
</template>

<script>
import {API_ROOT} from "../CrudApi";
import {FetchBuilder, morphToNotification} from "../api";

export default {
    name: "MediaResponsiveImages",
    data() {
        return {
            serverLog: '[no output]',
            hasServerLog: false,
            requestInFlight: false,
        }
    },
    methods: {
        async generate() {
            this.requestInFlight = true;
            this.hasServerLog = false;
            this.serverLog = '[generating...]';
            let result = await (FetchBuilder.default(this.$buefy, 'post')).fetch(API_ROOT + 'media/make-responsive');
            this.$buefy.toast.open(morphToNotification(result));
            this.requestInFlight = false;
            this.serverLog = result.log;
            this.hasServerLog = true;
            console.log(result);
        }
    }
}
</script>

<style scoped>
    @import './util.css';
</style>
