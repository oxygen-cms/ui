import ViewProfile from "./components/ViewProfile.vue";
import AuthenticationLog from "./components/AuthenticationLog.vue";
import MediaPage from "./components/MediaPage.vue";

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
        path: '/media2/list/:currentPath(.*)?',
        name: 'media.list',
        props: true,
        component: MediaPage,
        meta: { title: 'Photos & File Uploads'}
    },
    {
        path: '/media2/list',
        props: {
            currentPath: ''
        },
        component: MediaPage,
        meta: { title: 'Photos & File Uploads'}
    },
    {
        path: '/media2/trash',
        name: 'media.trash',
        props: {
            inTrash: true,
            currentPath: ''
        },
        component: MediaPage,
        meta: { title: 'Deleted Photos & File Uploads'}
    },
    {
        path: '/media2/search/:searchQuery',
        name: 'media.search',
        props: true,
        component: MediaPage,
        meta: { title: 'Search Photos & File Uploads'}
    }
];

export { UserProfileRoutes, MediaRoutes };
