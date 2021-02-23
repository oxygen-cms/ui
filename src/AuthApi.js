import {FetchBuilder} from "./api.js";
import {API_ROOT} from "./CrudApi";

export default class AuthApi {
    static async logout() {
        let data = await FetchBuilder
            .default('post')
            .fetch(API_ROOT + 'auth/logout');
        window.location = data.redirect;
        return data;
    }

    static async userDetails() {
        if(AuthApi.currentUserDetails) {
            return AuthApi.currentUserDetails;
        }

        let response = await FetchBuilder
            .default('get')
            .fetch(API_ROOT + 'auth/user');

        AuthApi.currentUserDetails = response;

        return response;
    }

    static async changePassword(oldPass, newPass, newPassAgain) {
        const params = {
            oldPassword: oldPass,
            password: newPass,
            passwordConfirmation: newPassAgain
        };
        console.log(params);
        return FetchBuilder
            .default('post')
            .withJson(params)
            .fetch(API_ROOT + 'auth/change-password');
    }

    static async terminateAccount() {
        return FetchBuilder
            .default('post')
            .withJson(params)
            .fetch(API_ROOT + 'auth/terminate-account');
    }
}
