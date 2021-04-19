<template>
    <div class="full-height full-height-container legacy-container">
        <iframe ref="legacyPage" class="stretch" />
        <b-loading :is-full-page="false" v-model="loading" :can-cancel="false"></b-loading>
        <b-modal :active.sync="isInsertMediaItemModalActive" trap-focus has-modal-card aria-role="dialog" aria-modal auto-focus width="80%" class="media-insert-modal">
            <MediaInsertModal @close="closeInsertMediaItemModal" @select="onFilesSelected" />
        </b-modal>
    </div>
</template>

<script>
import MediaInsertModal from "./MediaInsertModal.vue";

const onNavigated = (iframe, callback) => {
    const unloadHandler = () => {
        // Timeout needed because the URL changes immediately after
        // the `unload` event is dispatched.
        setTimeout(() => {
            if(iframe.contentWindow === null) {
                return;
            }
            callback(iframe.contentWindow.location.href);
        }, 1);
    };

    const attachUnload = () => {
        // Remove the unloadHandler in case it was already attached.
        // Otherwise, the change will be dispatched twice.
        iframe.contentWindow.removeEventListener("unload", unloadHandler);
        iframe.contentWindow.addEventListener("unload", unloadHandler);
    }

    iframe.addEventListener("load", attachUnload);
    attachUnload();
};

import { morphToNotification } from "../api";
import MediaApi from "../MediaApi";

// This component manages the tricky/hacky integration of two incompatible GUI systems.
// Legacy pages are rendered inside an iframe, and legacy pages can transition between each other using SmoothState.js
// When the iframe location is updated, so is the url of the parent page using this.$router.push()

export default {
    name: "LegacyPage",
    props: {
        routePrefix: String
    },
    data() {
        return {
            loadingPath: null,
            isInsertMediaItemModalActive: false,
            resolveInsertMediaItems: null,
            rejectInsertMediaItems: null
        }
    },
    components: { MediaInsertModal },
    computed: {
        loading() { return this.loadingPath != null; }
    },
    mounted() {
        window.document.body.style.overflowY = 'hidden';
        window.document.documentElement.style.overflowY = 'hidden';
        let elem = this.$refs.legacyPage;
        console.log(elem);
        this.loadPath(this.$route.fullPath);

        // SmoothState will call this callback when the path changes
        onNavigated(elem, this.onNavigated.bind(this));

        this.setupIframeIntegrations(elem);
        elem.onload = (_event) => {
            console.warn('Loaded OldPage contents from scratch for URL', elem.src);
            this.setupIframeIntegrations(elem);
            this.onLoaded();
        };
    },
    beforeRouteEnter(to, from, next) {
        // prevent navigation to this root if we are in an iframe
        if(window.location === window.parent.location) {
            next();
        }
    },
    beforeRouteUpdate(to, from, next) {
        // when the Vue route changes, load this path inside the iframe
        this.loadPath(to.fullPath);
        next();
    },
    beforeRouteLeave(to, from, next) {
        window.document.body.style.overflowY = 'auto';
        window.document.documentElement.style.overflowY = 'auto';
        next();
    },
    methods: {
        setupIframeIntegrations(elem) {
            elem.contentWindow.Oxygen = elem.contentWindow.Oxygen || {};
            elem.contentWindow.Oxygen.onNavigationBegin = this.onNavigated.bind(this);
            elem.contentWindow.Oxygen.onNavigationEnd = this.onLoaded.bind(this);
            elem.contentWindow.Oxygen.notify = this.showInnerNotification.bind(this);
            elem.contentWindow.Oxygen.openAlertDialog = this.openAlertDialog.bind(this);
            elem.contentWindow.Oxygen.insertMediaItem = this.openInsertMediaItemModal.bind(this);
            elem.contentWindow.Oxygen.openConfirmDialog = this.openConfirmDialog.bind(this);
            elem.contentWindow.Oxygen.popState = this.popState.bind(this);
        },
        fullURLToVuePath(url) {
            let urlObj = new URL(url);
            let urlString = urlObj.toString();
            if(urlObj.pathname.startsWith(this.routePrefix)) {
                return { loadInsideIframe: true, fullPath: urlString.split(this.routePrefix)[1] };
            } else {
                return { loadInsideIframe: false, url: urlString };
            }
        },
        vuePathToURL(path) {
            return this.routePrefix + path;
        },
        onNavigated(newURL) {
            let { loadInsideIframe, fullPath, url } = this.fullURLToVuePath(newURL);
            if(loadInsideIframe) {
                console.log(this.$route.fullPath, "-->", fullPath);
                if(this.$route.fullPath !== fullPath) {
                    this.$router.push(fullPath);
                }
            } else {
                // load outside of iframe
                window.location = url;
            }
        },
        showInnerNotification(data) {
            this.$buefy.notification.open(morphToNotification(data));
        },
        openAlertDialog(message) {
            this.$buefy.dialog.alert({
                message: message,
                size: 'is-small'
            });
        },
        openConfirmDialog(options) {
            this.$buefy.dialog.confirm(options);
        },
        popState() {
            this.$router.back();
        },
        onLoaded() {
            console.log('Loaded');
            let elem = this.$refs.legacyPage;
            document.title = elem.contentDocument.title;
            this.loadingPath = null;
        },
        loadPath(routePath) {
            if(this.loadingPath === routePath) {
                return;
            }
            let path = this.vuePathToURL(routePath);
            console.log('Loading', path);
            this.loadingPath = path;

            let elem = this.$refs.legacyPage;
            if(elem.contentWindow && typeof elem.contentWindow.smoothState !== 'undefined') {
                elem.contentWindow.smoothState.load(path, true);
            } else if(elem.src !== path) {
                // load the page from scratch
                elem.src = path;
            }
        },
        openInsertMediaItemModal() {
            this.isInsertMediaItemModalActive = true;
            return new Promise((resolve, reject) => {
                this.resolveInsertMediaItems = resolve;
                this.rejectInsertMediaItems = reject;
            });
        },
        closeInsertMediaItemModal() {
            this.rejectInsertMediaItems({ message: 'modal closed' });
            this.isInsertMediaItemModalActive = false;
        },
        onFilesSelected(files) {
            console.log(files);
            let include = files.map(item => MediaApi.generateIncludeStatement(item)).join("\n") + "\n";
            let filenames = files.map(item => item.fullPath).join(",");
            this.resolveInsertMediaItems(include);
            this.isInsertMediaItemModalActive = false;
            this.$buefy.toast.open({
                message: 'Inserted ' + filenames,
                type: 'is-info',
                queue: false
            });
        }
    }
}
</script>

<style scoped>
    @import  './util.css';

    .stretch {
        flex: 1;
        width: 100%;
    }

    .hidden {
        transition: opacity 1s ease, visibility 1s ease;
        opacity: 0;
        visibility: hidden;
    }

    .visible {
        opacity: 1;
        visibility: visible;
    }

    .legacy-container {
        position: relative;
    }

    .media-insert-modal ::v-deep .animation-content {
        width: 80%;
        height: 90%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>
