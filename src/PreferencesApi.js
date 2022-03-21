import {getApiRoot} from "./CrudApi";
import {FetchBuilder} from "./api";

export const canAccessPrefs = ($buefy, userPermissions, keys) => {
    console.log('Checking permissions for', keys);
    for(let key of keys) {
        let permissionsKey = 'preferences.' + key.split('::')[0].replace('.', '_');
        if(userPermissions.has(permissionsKey)) {
            console.log('Granted');
            return true;
        }
    }
    console.log('Denied');
    return false;
};

export default class PreferencesApi {

    constructor($buefy) {
        this.$buefy = $buefy;
    }

    request(method) {
        return FetchBuilder.default(this.$buefy, method);
    }

    async getValue(key) {
        return await this.request('get')
            .fetch(getApiRoot() + 'preferences/' + key);
    }

    async checkValid(key, value) {
        return await this.request('post')
            .withJson({
                value: value
            })
            .fetch(getApiRoot() + 'preferences/' + key + '/validate');
    }

    async setValue(key, value) {
        return await this.request('put')
            .withJson({
                value: value
            })
            .fetch(getApiRoot() + 'preferences/' + key);
    }
}
