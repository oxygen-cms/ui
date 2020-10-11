import UserProfile from "./components/UserProfile.vue";
import ViewProfile from "./components/ViewProfile.vue";
import AuthenticationLog from "./components/AuthenticationLog.vue";

const UserProfileRoutes = {
    path: '/auth',
    component: UserProfile,
    children: [
        {
            path: 'profile',
            name: 'auth.viewProfile',
            component: ViewProfile,
            meta: { title: 'View Profile' }
        },
        {
            path: 'login-log',
            component: AuthenticationLog,
            meta: { title: 'Logins & Login Attempts' }
        },
    ]
};

export { UserProfileRoutes };
