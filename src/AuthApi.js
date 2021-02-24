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
        }

        let response = await FetchBuilder.default(this.$buefy, 'get')
            .fetch(API_ROOT + 'auth/user');

        AuthApi.currentUserDetails = response;

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
