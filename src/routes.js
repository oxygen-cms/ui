import ViewProfile from "./components/ViewProfile.vue";
import AuthenticationLog from "./components/AuthenticationLog.vue";
import MediaPage from "./components/MediaPage.vue";
import MediaResponsiveImages from "./components/MediaResponsiveImages.vue";
import Error404 from './components/Error404.vue';
import LegacyPage from './components/LegacyPage.vue';

const UserProfileRoutes =  [
    {
        path: '/auth/profile',
        name: 'auth.viewProfile',
        component: ViewProfile,
        meta: { title: 'View Profile' }
    },
    {
        path: '/auth/login-log',
        component: AuthenticationLog,
        meta: { title: 'Logins & Login Attempts' }
    },
];

const MediaRoutes = [
    {
        path: '/media/list/:currentPath(.*)?',
        name: 'media.list',
        props: true,
        component: MediaPage,
        meta: { title: 'Photos & File Uploads'}
    },
    {
        path: '/media/list',
        props: {
            currentPath: ''
        },
        component: MediaPage,
        meta: { title: 'Photos & File Uploads'}
    },
    {
        path: '/media/trash',
        name: 'media.trash',
        props: {
            inTrash: true,
            currentPath: ''
        },
        component: MediaPage,
        meta: { title: 'Deleted Photos & File Uploads'}
    },
    {
        path: '/media/search/:searchQuery',
        name: 'media.search',
        props: true,
        component: MediaPage,
        meta: { title: 'Search Photos & File Uploads'}
    },
    {
        path: '/media/responsive-images',
        name: 'media.responsiveImages',
        component: MediaResponsiveImages,
        meta: { title: 'Responsive Images'}
    }
];

const CatchAllRoutes = [
    {
        path: '/',
        redirect: { name: 'dashboard' }
    },
    {
        path: '/404',
        name: 'error404',
        component: Error404,
        meta: { title: 'Not found' }
    },
    {
        // will match everything, try to render a legacy Oxygen page...
        path: '*',
        component: LegacyPage,
        props: {
            legacyPrefix: '/oxygen/view',
            adminPrefix: '/oxygen'
        }
    }
];

const AuthRoutes = [
    {
        name: 'login'
    }
];

export { UserProfileRoutes, MediaRoutes, CatchAllRoutes, AuthRoutes };
