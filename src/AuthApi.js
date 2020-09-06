import {FetchBuilder} from "./api.js";

export default class AuthApi {
    static logout(callback) {
        return FetchBuilder
            .default('post')
            .fetch('/oxygen/auth/logout', (data) => {
                window.location = data.redirect;
                callback(data);
            });
    }
}
