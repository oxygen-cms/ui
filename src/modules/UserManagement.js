import ViewProfile from "../components/ViewProfile.vue";
import AuthenticationLog from "../components/AuthenticationLog.vue";
import UserManagement from "../components/UserManagement.vue";
import UserProfilePage from "../components/UserProfilePage.vue";

export default function(ui) {
    ui.addAuthenticatedRoutes([
        {
            path: 'users/:id',
            name: 'users.viewProfile',
            component: UserProfilePage,
            meta: { title: 'User Profile' }
        },
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
    ]);
}