import {getApiRoot} from "./CrudApi";
import {FetchBuilder, initCsrfCookie} from "./api";
import UserPermissions from "./UserPermissions";

export default class AuthApi {

    constructor($buefy) {
        this.$buefy = $buefy;
    }

    request(method) {
        return FetchBuilder.default(this.$buefy, method);
    }

    async login(username, password, code) {
        return await this.request('post')
            .withJson({
                username,
                password,
                '2fa_code': code
            })
            .fetch(getApiRoot() + 'auth/login');
    }

    async getLoginPreferences() {
        return await this.request('get').fetch(getApiRoot() + 'auth/preferences');
    }

    async setupTwoFactorAuth() {
        return await this.request('post')
            .fetch(getApiRoot() + 'auth/two-factor-setup');
    }

    async confirmTwoFactorAuth(code) {
        return await this.request('post')
            .withJson({
                '2fa_code': code
            })
            .fetch(getApiRoot() + 'auth/two-factor-confirm');
    }

    async sendReminderEmail(email) {
        return await this.request('post')
            .withJson({
                'email': email
            })
            .fetch(getApiRoot() + 'auth/send-reminder-email');
    }

    async sendEmailVerification() {
        return await this.request('post')
            .fetch(getApiRoot() + 'auth/verify-email');
    }

    async resetPassword(params) {
        return await this.request('post')
            .withJson(params)
            .fetch(getApiRoot() + 'auth/reset-password');
    }

    async logout() {
        let response = await this.request('post')
            .fetch(getApiRoot() + 'auth/logout');
        this.$buefy.notification.open({
            message: 'You have been logged out',
            type: 'is-info',
            duration: 4000,
            queue: false
        });
        await initCsrfCookie();
        return response;
    }

    async changePassword(oldPass, newPass, newPassAgain) {
        const params = {
            oldPassword: oldPass,
            password: newPass,
            passwordConfirmation: newPassAgain
        };
        console.log(params);
        return this.request('post')
            .withJson(params)
            .fetch(getApiRoot() + 'auth/change-password');
    }

    async listUserSessions() {
        return this.request('get')
            .fetch(getApiRoot() + 'auth/sessions')
    }

    async deleteUserSession(id) {
        return this.request('delete')
            .fetch(getApiRoot() + 'auth/sessions/' + id)
    }
}

export const checkAuthenticated = (store) => {
    return (to, from, next) => {
        store.dispatch('determineLoginStatus').then((isLoggedIn) => {
            if(!to.path.startsWith('/auth/login') && !isLoggedIn && to.meta.allowUnauthenticated !== true) {
                UserPermissions.$buefy.notification.open({
                    message: 'You need to be logged in to view that page',
                    type: 'is-info',
                    queue: false,
                    duration: 7000
                });
                next({
                    path: '/auth/login',
                    query: { redirect: to.fullPath }
                });
            } else {
                next();
            }
        })
    }
};
