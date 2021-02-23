<template>
    <div>
        <iframe ref="legacyPage" class="stretch" />
        <b-loading :is-full-page="true" v-model="loading" :can-cancel="false"></b-loading>
    </div>
</template>

<script>
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
import { NotificationProgrammatic as Notification } from 'buefy';

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
            loadingPath: null
        }
    },
    computed: {
        loading() { return this.loadingPath != null; }
    },
    mounted() {
        let elem = this.$refs.legacyPage;
        console.log(elem);
        this.loadPath(this.$route.fullPath);
        onNavigated(elem, this.onNavigated.bind(this));
        elem.onload = (_event) => {
            console.warn('Loaded OldPage contents from scratch for URL', elem.src);
            this.onLoaded();

            // SmoothState will call this callback when the path changes
            elem.contentWindow.Oxygen = elem.contentWindow.Oxygen || {};
            elem.contentWindow.Oxygen.onNavigationBegin = this.onNavigated.bind(this);
            elem.contentWindow.Oxygen.onNavigationEnd = this.onLoaded.bind(this);
            elem.contentWindow.Oxygen.notify = this.showInnerNotification.bind(this);
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
    methods: {
        fullURLToVuePath(url) {
            return url.split(this.routePrefix)[1];
        },
        vuePathToURL(path) {
            return this.routePrefix + path;
        },
        onNavigated(newURL) {
            let newPath = this.fullURLToVuePath(newURL);
            this.loadingPath = newPath;
            console.log(this.$route.fullPath, "-->", newPath);
            if(this.$route.fullPath !== newPath) {
                this.$router.push(newPath);
            }
        },
        showInnerNotification(data) {
            this.$buefy.notification.open(morphToNotification(data));
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
        }
    }
}
</script>

<style scoped>
    .stretch {
        height: 100%;
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
</style>
