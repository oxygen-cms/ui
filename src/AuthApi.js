import {API_ROOT} from "./CrudApi";
import {FetchBuilder} from "./api";

export default class AuthApi {

    constructor($buefy) {
        this.$buefy = $buefy;
    }

    request(method) {
        return FetchBuilder.default(this.$buefy, method);
    }

    async logout() {
        let data = await this.request('post')
            .fetch(API_ROOT + 'auth/logout');
        window.location = data.redirect;
        return data;
    }

    async stopImpersonating() {
        let data = await this.request('post')
            .fetch('/oxygen/view/users/leaveImpersonate');
        console.log(data);
        window.location = data.redirect;
        return data;
    }

    async userDetails() {
        if(AuthApi.currentUserDetails) {
            return AuthApi.currentUserDetails;
        } else if(AuthApi.currentlyFetchingUserDetails === true) {
            return new Promise((resolve, reject) => {
                AuthApi.userDetailsResolvedHooks.push(resolve);
            });
        }

        AuthApi.currentlyFetchingUserDetails = true;
        let response = await this.request('get')
            .fetch(API_ROOT + 'auth/user');

        AuthApi.currentUserDetails = response;
        AuthApi.currentlyFetchingUserDetails = false;
        for(let hook of AuthApi.userDetailsResolvedHooks) {
            hook(response);
        }
        AuthApi.userDetailsResolvedHooks = [];

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

    async updateFullName(name) {
        return this.request('put')
            .withJson({
                fullName: name
            })
            .fetch(API_ROOT + 'auth/fullName');
    }

    async terminateAccount() {
        return this.request('post')
            .withJson(params)
            .fetch(API_ROOT + 'auth/terminate-account');
    }
}

AuthApi.currentlyFetchingUserDetails = false;
AuthApi.currentUserDetails = null;
AuthApi.userDetailsResolvedHooks = [];
