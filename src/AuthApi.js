import {API_ROOT} from "./CrudApi";
import {FetchBuilder, initCsrfCookie} from "./api";

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
            .fetch(API_ROOT + 'auth/login');
    }

    async getLoginPreferences() {
        return await this.request('get').fetch(API_ROOT + 'auth/preferences');
    }

    async setupTwoFactorAuth() {
        return await this.request('post')
            .fetch(API_ROOT + 'auth/two-factor-setup');
    }

    async confirmTwoFactorAuth(code) {
        return await this.request('post')
            .withJson({
                '2fa_code': code
            })
            .fetch(API_ROOT + 'auth/two-factor-confirm');
    }

    async sendReminderEmail(email) {
        return await this.request('post')
            .withJson({
                'email': email
            })
            .fetch(API_ROOT + 'auth/send-reminder-email');
    }

    async sendEmailVerification() {
        return await this.request('post')
            .fetch(API_ROOT + 'auth/verify-email');
    }

    async resetPassword(params) {
        return await this.request('post')
            .withJson(params)
            .fetch(API_ROOT + 'auth/reset-password');
    }

    async logout() {
        let response = await this.request('post')
            .fetch(API_ROOT + 'auth/logout');
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
            .fetch(API_ROOT + 'auth/change-password');
    }

    async listUserSessions() {
        return this.request('get')
            .fetch(API_ROOT + 'auth/sessions')
    }

    async deleteUserSession(id) {
        return this.request('delete')
            .fetch(API_ROOT + 'auth/sessions/' + id)
    }
}
