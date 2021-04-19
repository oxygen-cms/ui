import {API_ROOT} from "./CrudApi";
import {FetchBuilder} from "./api";

export default class AuthApi {

    constructor($buefy) {
        this.$buefy = $buefy;
    }

    async logout() {
        let data = await FetchBuilder.default(this.$buefy, 'post')
            .fetch(API_ROOT + 'auth/logout');
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
        let response = await FetchBuilder.default(this.$buefy, 'get')
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
        return FetchBuilder.default(this.$buefy, 'post')
            .withJson(params)
            .fetch(API_ROOT + 'auth/change-password');
    }

    async terminateAccount() {
        return FetchBuilder.default(this.$buefy, 'post')
            .withJson(params)
            .fetch(API_ROOT + 'auth/terminate-account');
    }
}

AuthApi.currentlyFetchingUserDetails = false;
AuthApi.currentUserDetails = null;
AuthApi.userDetailsResolvedHooks = [];
