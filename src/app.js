import Router from 'vue-router';
import Person from './components/Person.vue';
import PersonCreate from './components/PersonCreate.vue';
import PersonList from './components/PersonList.vue';
import PersonEdit from './components/PersonEdit.vue';
import PersonImportFromTryBooking from './components/PersonImportFromTryBooking.vue';
import PersonExportToMailgun from "./components/PersonExportToMailgun.vue";
import PersonExport from "./components/PersonExport.vue";
import PersonMailgunCheckUnsubscribes from "./components/PersonMailgunCheckUnsubscribes.vue";
import AuthenticationLog from "./components/AuthenticationLog.vue";
import Tags from "./components/Tags.vue";
import Error404 from './components/Error404.vue';
import Vue from 'vue';
import Buefy from 'buefy';
import App from './components/App.vue';
import UserPreferences from "./UserPreferences";
import VHotkey from 'v-hotkey';

import { library } from '@fortawesome/fontawesome-svg-core';
// internal icons
import {
    faCheck,
    faCheckCircle,
    faInfoCircle,
    faExternalLinkAlt,
    faExclamationTriangle,
    faExclamationCircle,
    faArrowUp,
    faAngleRight,
    faAngleLeft,
    faAngleDown,
    faEye,
    faEyeSlash,
    faCaretDown,
    faCaretUp,
    faUpload,
    faPlus,
    faCogs,
    faPuzzlePiece,
    faPhotoVideo,
    faUserPlus,
    faMailBulk,
    faUsers,
    faArrowLeft,
    faRecycle,
    faList,
    faFileAlt,
    faUserAlt,
    faStamp,
    faCalendarAlt,
    faAddressCard,
    faFileImport,
    faUser,
    faFileExport,
    faDownload,
    faFileExcel,
    faFileCsv,
    faChevronCircleDown,
    faChevronCircleUp,
    faTrash,
    faSearch, faBan, faTicketAlt, faPencilAlt, faRedoAlt, faTag, faTags, faMusic, faCalendarDay, faTimesCircle
} from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import MainDashboard from "./components/MainDashboard.vue";
import {morphToNotification} from "./api";

library.add(faCheck, faCheckCircle, faInfoCircle, faExclamationTriangle, faExclamationCircle, faFileAlt,
    faArrowUp, faAngleRight, faAngleLeft, faTicketAlt, faTags, faCalendarDay, faTimesCircle, faMusic, faPencilAlt, faRedoAlt, faBan, faExternalLinkAlt, faSearch, faAngleDown, faUserAlt, faCogs, faPhotoVideo, faPuzzlePiece, faPlus, faUserPlus, faMailBulk, faUsers, faArrowLeft, faRecycle, faList, faStamp, faCalendarAlt, faAddressCard, faFileImport, faFileExport, faDownload, faFileExcel, faFileCsv, faChevronCircleDown, faChevronCircleUp, faTrash,
    faEye, faEyeSlash, faCaretDown, faCaretUp, faUpload, faUser);
Vue.component('vue-fontawesome', FontAwesomeIcon);

Vue.use(VHotkey);
Vue.use(Buefy, {
    defaultIconComponent: 'vue-fontawesome',
    defaultIconPack: 'fas',
});
Vue.use(Router);

const routes = [
    {
        path: '/people',
        component: Person,
        children: [
            {
                path: 'create',
                name: 'people.create',
                component: PersonCreate,
                meta: { title: 'Add Person' }
            },
            {
                path: '/',
                name: 'people.list',
                component: PersonList,
                props: (route) => ({ trash: false }),
                meta: { title: 'People' }
            },
            {
                path: 'trash',
                name: 'people.trash',
                component: PersonList,
                props: (route) => ({ trash: true }),
                meta: { title: 'Deleted People' }
            },
            {
                path: 'trybooking-import',
                name: 'people.trybookingImport',
                component: PersonImportFromTryBooking,
                meta: { title: 'Import from TryBooking' }
            },
            {
                path: 'mailgun-export',
                name: 'people.mailgunExport',
                component: PersonExportToMailgun,
                meta: { title: 'Export to Mailgun' }
            },
            {
                path: 'mailgun-check-unsubscribes',
                name: 'people.mailgunCheckUnsubscribes',
                component: PersonMailgunCheckUnsubscribes,
                meta: { title: 'Check Mailgun for Unsubscribes'}
            },
            {
                path: 'export',
                name: 'people.export',
                component: PersonExport,
                meta: { title: 'Export People' }
            },
            {
                path: ':id',
                name: 'people.view',
                component: PersonEdit,
                meta: { title: 'Editing Person' }
            },
        ]
    },
    { path: '/tags', component: Tags, meta: { title: 'Edit tags' } },
    {
        path: '/auth/login-log',
        component: AuthenticationLog,
        meta: { title: 'Logins & Login Attempts' }
    },
    {
        path: '/dashboard',
        component: MainDashboard,
        props: (route) => {
            return {
                items: UserPreferences.get('dashboard.resources.order')
            }
        },
        meta: { title: 'Dashboard' }
    },
    { path: '/', redirect: '/dashboard' },
    {
        // will match everything
        path: '*',
        component: Error404,
        meta: { title: 'Not found' }
    }
];

const router = new Router({
    routes: routes,
    base: '/oxygen/',
    mode: 'history',
});

var app = new Vue({
    router: router,
    components: { App }
}).$mount('#app');

if(typeof window.OXYGEN_SESSION_NOTIFICATION !== 'undefined') {
    app.$buefy.toast.open(morphToNotification(window.OXYGEN_SESSION_NOTIFICATION));
}