import {getApiRoot, CrudApi} from './CrudApi';

export default class UsersApi extends CrudApi {

    static prepareModelForAPI(data) {
        let m = { ...data  };
        delete m.id;
        if(m.group) {
            m.group = m.group.id;
        }
        return m;
    }

    static getResourceName() {
        return 'users';
    }

    async updateFullName(id, name) {
        return this.request('put')
            .withJson({
                fullName: name
            })
            .fetch(getApiRoot() + 'users/' + id + '/fullName');
    }

    async getBasic(id) {
        return this.request('get')
            .fetch(this.constructor.getResourceRoot() + '/' + id + '/basic');
    }

    async impersonate(id) {
        return await this.request('post')
            .fetch(getApiRoot() + 'users/' + id + '/impersonate');
    }

    async forceDelete(id) {
        return this.request('delete')
            .fetch(this.constructor.getResourceRoot() + '/' + id + '/force');
    }

    async stopImpersonating() {
        return await this.request('post')
            .fetch(getApiRoot() + 'users/stop-impersonating');
    }

}
