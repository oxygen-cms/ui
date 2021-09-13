import {API_ROOT} from "./CrudApi";
import {FetchBuilder} from "./api";

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

    async logout() {
        return await this.request('post')
            .fetch(API_ROOT + 'auth/logout');
    }

    async stopImpersonating() {
        let data = await this.request('post')
            .fetch('/oxygen/view/users/leaveImpersonate');
        console.log(data);
        window.location = data.redirect;
        return data;
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

    async updateFullName(name) {
        return this.request('put')
            .withJson({
                fullName: name
            })
            .fetch(API_ROOT + 'auth/fullName');
    }

    async terminateAccount() {
        return this.request('post')
            .withJson({})
            .fetch(API_ROOT + 'auth/terminate-account');
    }
}
