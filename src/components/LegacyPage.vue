<template>
    <div class="full-height full-height-container legacy-container">
        <transition name="fade">
            <iframe ref="iframe" class="iframe" v-show="!loading" />
        </transition>
<!--        <b-loading :is-full-page="false" v-model="loading" :can-cancel="false"></b-loading>-->

        <MediaInsertModal :active.sync="isInsertMediaItemModalActive" @close="closeInsertMediaItemModal" @select="onFilesSelected" />
    </div>
</template>

<script>
import MediaInsertModal from "./MediaInsertModal.vue";

import { morphToNotification } from "../api";
import MediaApi from "../MediaApi";
import UserPreferences from "../UserPreferences";

// from https://gist.github.com/hdodov/a87c097216718655ead6cf2969b0dcfa

const iframeURLChange = (iframe, callback, legacyPage) => {
    var unloadHandler = function() {
        console.log('[LegacyPage] Starting load');
        legacyPage.loadingPath = 'unknown';
        // Timeout needed because the URL changes immediately after
        // the `unload` event is dispatched.
        // TODO: this is rather brittle because I believe it relies upon timing
        // setTimeout(function() {
        //     console.log(iframe.contentWindow);
        //     if(iframe.contentWindow) {
        //         callback(iframe.contentWindow.location.href);
        //     }
        // }, 0);
    };

    function attachUnload() {
        // Remove the unloadHandler in case it was already attached.
        // Otherwise, the change will be dispatched twice.
        iframe.contentWindow.removeEventListener("unload", unloadHandler);
        iframe.contentWindow.addEventListener("unload", unloadHandler);
    }

    iframe.addEventListener("load", attachUnload);
    attachUnload();
}

// This component manages the tricky/hacky integration of two incompatible GUI systems.
// Legacy pages are rendered inside an iframe, and legacy pages can transition between each other using SmoothState.js
// When the iframe location is updated, so is the url of the parent page using this.$router.push()

export default {
    name: "LegacyPage",
    props: {
        legacyPrefix: String,
        adminPrefix: String
    },
    data() {
        return {
            loadingPath: null,
            currentPath: null,
            isInsertMediaItemModalActive: false,
            resolveInsertMediaItems: null,
            rejectInsertMediaItems: null,
            userPreferences: null
        }
    },
    components: { MediaInsertModal },
    computed: {
        loading() { return this.loadingPath !== null; }
    },
    async mounted() {
        this.loadingPath = 'prefs';
        this.userPreferences = await UserPreferences.load();

        window.document.body.style.overflowY = 'hidden';
        window.document.documentElement.style.overflowY = 'hidden';
        let iframe = this.$refs.iframe;

        iframeURLChange(iframe, this.onNavigated.bind(this), this);

        this.loadPath(this.$route.fullPath);

        iframe.addEventListener('load', this.onLoaded.bind(this));
        if(iframe.contentDocument.readyState === "complete") {
            console.warn('[LegacyPage] mounted: page was already loaded - perhaps this page was cached?');
            this.onLoaded();
        }
    },
    unmounted() {
        this.$parent.$data.requestedCollapsed = false;
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
        setupIframeIntegrations() {
            console.log('[LegacyPage] Setting up iframe integrations for', this.$refs.iframe.contentWindow.location.href);
            let elem = this.$refs.iframe;
            elem.contentWindow.Oxygen = elem.contentWindow.Oxygen || {};
            elem.contentWindow.Oxygen.user = this.userPreferences.preferences;
            elem.contentWindow.Oxygen.onNavigationBegin = this.onNavigated.bind(this);
            elem.contentWindow.Oxygen.onNavigationEnd = this.onLoaded.bind(this);
            elem.contentWindow.Oxygen.notify = this.showInnerNotification.bind(this);
            elem.contentWindow.Oxygen.openAlertDialog = this.openAlertDialog.bind(this);
            elem.contentWindow.Oxygen.insertMediaItem = this.openInsertMediaItemModal.bind(this);
            elem.contentWindow.Oxygen.openConfirmDialog = this.openConfirmDialog.bind(this);
            elem.contentWindow.Oxygen.popState = this.popState.bind(this);
            elem.contentWindow.Oxygen.onToggleFullscreen = this.onToggleFullscreen.bind(this);

            if(elem.contentWindow.Oxygen.onLoadedInsideIFrame) {
                elem.contentWindow.Oxygen.onLoadedInsideIFrame();
            } else {
                console.warn('[LegacyPage] no onLoadedInsideIFrame callback set');
            }
        },
        fullURLToVuePath(url) {
            let urlObj = new URL(url);
            let urlString = urlObj.toString();
            if(urlObj.pathname.startsWith(this.legacyPrefix)) {
                return { loadInside: 'iframe', location: this.adminPrefix + urlString.split(this.legacyPrefix)[1] };
            } else if(urlObj.pathname.startsWith(this.adminPrefix)) {
                return { loadInside: 'vue', location: urlString.split(this.adminPrefix)[1] };
            } else {
                return { loadInside: false, location: urlString };
            }
        },
        vuePathToURL(path) {
            return this.legacyPrefix + path;
        },
        // We detect when the iframe url changes, and update our window accordingly...
        onNavigated(newURL) {
            console.log('[LegacyPage] Navigated to ' + newURL);

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
            let path = this.$refs.iframe.contentWindow.location.href;
            if(path === 'about:blank') { return; }
            console.log('[LegacyPage] Loaded', path);

            if(path !== this.currentPath) {
                let { loadInside, location } = this.fullURLToVuePath(path);
                console.log('[LegacyPage] ', loadInside, location);
                if(loadInside === 'iframe') {
                    window.history.pushState({}, "", location);
                } else if(loadInside === 'vue') {
                    this.$router.push(location);
                } else {
                    // load outside of iframe
                    window.location = location;
                }

                this.currentPath = path;
            }

            document.title = this.$refs.iframe.contentDocument.title;
            this.setupIframeIntegrations();

            this.loadingPath = null;
        },
        loadPath(routePath) {
            let path = this.vuePathToURL(routePath);
            if(path === '/oxygen/view/auth/login') {
                console.log('[LegacyPage] Need to login again, redirecting...');
                window.location.replace('/oxygen/view/auth/login');
            }

            console.log('[LegacyPage] Loading', path);

            this.loadingPath = path;

            let elem = this.$refs.iframe;
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
            let include = files.map(item => MediaApi.generateIncludeStatement(item)).join("\n") + "\n";
            let filenames = files.map(item => item.fullPath).join(",");
            this.resolveInsertMediaItems(include);
            this.isInsertMediaItemModalActive = false;
            this.$buefy.toast.open({
                message: 'Inserted ' + filenames,
                type: 'is-info',
                queue: false
            });
        },
        onToggleFullscreen(mode) {
            this.$parent.$data.requestedCollapsed = mode;
        }
    }
}
</script>

<style scoped lang="scss">
    @import  './util.css';
    @import '../styles/_variables.scss';

    .iframe {
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
        background-color: $grey-lightest;
    }
</style>
