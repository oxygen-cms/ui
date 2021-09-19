import AuthenticatedLayout from "../components/AuthenticatedLayout.vue";
import Login from "../components/auth/Login.vue";
import Logout from "../components/auth/Logout.vue";
import WelcomeFloat from "../components/auth/WelcomeFloat.vue";
import TwoFactorSetup from "../components/auth/TwoFactorSetup.vue";
import PasswordRemind from "../components/auth/PasswordRemind.vue";
import PasswordReset from "../components/auth/PasswordReset.vue";
import Auth404 from "../components/auth/Auth404.vue";
import VerifyEmail from "../components/auth/VerifyEmail.vue";

export const AuthRoutes = [
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

export const makeAuthenticatedRoute = (children) => {
    return {
        path: '/',
        component: AuthenticatedLayout,
        props: true,
        redirect: '/dashboard',
        children: children,
    }
};

