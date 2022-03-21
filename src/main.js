import Router from 'vue-router';
import App from './components/App.vue';
import UserPermissions from './UserPermissions';
import UserPreferences from './UserPreferences';
import VHotkey from 'v-hotkey';
import Buefy from 'buefy';
import AsyncComputed from 'vue-async-computed';
import { FetchBuilder } from './api';
import { addIconsToLibrary } from './icons';
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { AuthRoutes, makeAuthenticatedRoute } from "./routes";
import createStore from "./store/index";
import { checkAuthenticated } from "./AuthApi";
import Error404 from "./components/Error404.vue";
import MainMenu from "./components/MainMenu.vue";

/**
 * Creates the Vue.js Oxygen application, allowing for a few points of customization (i.e.: adding modules)
 * @param Vue
 * @param extraRoutes
 * @param extraComponents
 * @param beforeMount
 */
export default class OxygenUI {
    constructor(Vue) {
        this.app = null;
        this.Vue = Vue;
        this.authenticatedRoutes = []
        this.unauthenticatedRoutes = []
        this.mainMenuItems = {}
        this.rootComponents = { App, MainMenu }
        this.beforeMountHooks = []
    }

    addAuthenticatedRoutes(routes) {
        for (let route of routes) {
            this.authenticatedRoutes.push(route);
        }
    }

    addRoute(route) {
        this.authenticatedRoutes.push(route);
    }

    addMainMenuGroup(category, group) {
        if(!this.mainMenuItems[category]) {
            this.mainMenuItems[category] = {};
        }
        if(!group.items) {
            group.items = {};
        }
        this.mainMenuItems[category][group.name] = group;
        return group;
    }

    addUnauthenticatedRoutes(routes) {
        for (let route of routes) {
            this.unauthenticatedRoutes.push(route);
        }
    }

    registerModule(module) {
        module(this)
    }

    createApp() {
        // this could occur if we encounter a bad link inside the <LegacyPage> functionality
        // TODO: remove this once <LegacyPage> is gone
        if (window.location !== window.parent.location) {
            throw new Error('refusing to load application inside of an iframe');
        }

        addIconsToLibrary();
        this.Vue.component('vue-fontawesome', FontAwesomeIcon);
        this.Vue.use(Buefy, {
            defaultIconComponent: 'vue-fontawesome',
            defaultIconPack: 'fas',
        });
        this.Vue.use(VHotkey);
        this.Vue.use(AsyncComputed);
        this.Vue.use(Router);

        const store = createStore(this.Vue);

        const routes = AuthRoutes
            .concat([
                makeAuthenticatedRoute(this.authenticatedRoutes)
            ])
            .concat(this.unauthenticatedRoutes)
            .concat([
                {
                    path: '/not-found',
                    name: 'error404',
                    component: Error404,
                    meta: {title: 'Not found'}
                },
                {
                    path: '/*',
                    redirect: { name: 'error404' }
                }
            ]);

        const router = new Router({
            routes: routes,
            base: '/oxygen/',
            mode: 'history'
        });

        router.beforeEach(checkAuthenticated(store));

        this.app = new this.Vue({
            router: router,
            data: {
                existingAppTitle: document.title,
                mainMenuItems: this.mainMenuItems
            },
            components: this.rootComponents,
            store
        });

        FetchBuilder.setRouter(router);
        UserPermissions.setBuefy(this.app.$buefy);
        UserPreferences.setBuefy(this.app.$buefy)
        return this;
    }

    mount(selector) {
        for(let hook of this.beforeMountHooks) {
            hook(this.app);
        }
        this.app.$mount(selector);
    }
}

export const WEB_CONTENT = 'Web Content';

