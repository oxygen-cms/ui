import UserProfile from "./components/UserProfile.vue";
import ViewProfile from "./components/ViewProfile.vue";
import EditProfile from "./components/EditProfile.vue";
import ChangePassword from "./components/ChangePassword.vue";

const UserProfileRoutes = {
    path: '/auth/profile',
    component: UserProfile,
    children: [
        {
            path: '/',
            name: 'auth.viewProfile',
            component: ViewProfile,
            meta: { title: 'View Profile' }
        },
        {
            path: 'edit',
            name: 'auth.editProfile',
            component: EditProfile,
            meta: { title: 'Edit Profile' }
        },
        {
            path: 'change-password',
            name: 'auth.changePassword',
            component: ChangePassword,
            meta: { title: 'Change Password' }
        }
    ]
};

export { UserProfileRoutes };
