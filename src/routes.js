import ViewProfile from "./components/ViewProfile.vue";
import AuthenticationLog from "./components/AuthenticationLog.vue";
import MediaPage from "./components/media/MediaPage.vue";
import MediaResponsiveImages from "./components/media/MediaResponsiveImages.vue";
import Error404 from './components/Error404.vue';
import AuthenticatedLayout from "./components/AuthenticatedLayout.vue";
import Login from "./components/auth/Login.vue";
import Logout from "./components/auth/Logout.vue";
import WelcomeFloat from "./components/auth/WelcomeFloat.vue";
import TwoFactorSetup from "./components/auth/TwoFactorSetup.vue";
import PasswordRemind from "./components/auth/PasswordRemind.vue";
import PasswordReset from "./components/auth/PasswordReset.vue";
import Auth404 from "./components/auth/Auth404.vue";
import UserManagement from "./components/UserManagement.vue";
import VerifyEmail from "./components/auth/VerifyEmail.vue";

const UserProfileRoutes =  [
    {
        path: 'user/profile',
        name: 'auth.viewProfile',
        component: ViewProfile,
        meta: { title: 'View Profile' }
    },
    {
        path: 'user/login-log',
        component: AuthenticationLog,
        meta: { title: 'Logins & Login Attempts' }
    },
    {
        path: 'users',
        component: UserManagement,
        meta: { title: 'Manage Users'}
    }
];

const MediaRoutes = [
    {
        path: 'media/list/:currentPath(.*)?',
        name: 'media.list',
        props: true,
        component: MediaPage,
        meta: { title: 'Photos & File Uploads'}
    },
    {
        path: 'media/list',
        props: {
            currentPath: ''
        },
        component: MediaPage,
        meta: { title: 'Photos & File Uploads'}
    },
    {
        path: 'media/trash',
        name: 'media.trash',
        props: {
            inTrash: true,
            currentPath: ''
        },
        component: MediaPage,
        meta: { title: 'Deleted Photos & File Uploads'}
    },
    {
        path: 'media/search/:searchQuery',
        name: 'media.search',
        props: true,
        component: MediaPage,
        meta: { title: 'Search Photos & File Uploads'}
    },
    {
        path: 'media/responsive-images',
        name: 'media.responsiveImages',
        component: MediaResponsiveImages,
        meta: { title: 'Responsive Images'}
    }
];

const CatchAllRoutes = [
    {
        path: '*',
        name: 'error404',
        component: Error404,
        meta: { title: 'Not found' }
    }
];

const AuthRoutes = [
    {
        path: '/auth',
        component: WelcomeFloat,
        meta: {
            allowUnauthenticated: true
        },
        children: [
            {
                name: 'login',
                path: 'login',
                component: Login,
                meta: {
                    title: 'Login',
                    allowUnauthenticated: true
                }
            },
            {
                name: 'logout',
                path: 'logout',
                component: Logout,
                meta: {
                    title: 'Logout',
                    allowUnauthenticated: true
                }
            },
            {
                name: '2fa-setup',
                path: '2fa-setup',
                component: TwoFactorSetup,
                meta: {
                    title: 'Setup two factor authentication'
                }
            },
            {
                name: 'forgot-password',
                path: 'forgot-password',
                component: PasswordRemind,
                meta: {
                    title: 'Forgot Password',
                    allowUnauthenticated: true
                }
            },
            {
                name: 'reset-password',
                path: 'reset-password',
                component: PasswordReset,
                meta: {
                    title: 'Reset Password',
                    allowUnauthenticated: true
                }
            },
            {
                name: 'needs-verified-email',
                path: 'needs-verified-email',
                component: VerifyEmail,
                meta: {
                    title: 'Verify your email address'
                }
            },
            {
                path: '',
                component: Auth404
            },
            {
                path: '*',
                component: Auth404
            }
        ]
    }
];

const makeAuthenticatedRoute = (children) => {
    return {
        path: '/',
        component: AuthenticatedLayout,
        props: true,
        redirect: '/dashboard',
        children: children,
    }
};

export { UserProfileRoutes, MediaRoutes, CatchAllRoutes, AuthRoutes, makeAuthenticatedRoute };
