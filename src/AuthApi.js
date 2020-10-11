import {FetchBuilder} from "./api.js";
import {API_ROOT} from "./CrudApi";

export default class AuthApi {
    static logout(callback) {
        return FetchBuilder
            .default('post')
            .fetch('/oxygen/auth/logout', (data) => {
                window.location = data.redirect;
                callback(data);
            });
    }

    static userDetails(callback) {
        return FetchBuilder
            .default('get')
            .fetch(API_ROOT + 'auth/user', callback);
    }

    static changePassword(oldPass, newPass, newPassAgain, callback) {
        return FetchBuilder
            .default('post')
            .withJson({
                oldPassword: oldPass,
                password: newPass,
                passwordConfirmation: newPassAgain
            })
            .fetch(API_ROOT + 'auth/change-password', callback);
    }
}
