import {API_ROOT, CrudApi} from './CrudApi';

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
            .fetch(API_ROOT + 'users/' + id + '/fullName');
    }

    async impersonate(id) {
        return await this.request('post')
            .fetch(API_ROOT + 'users/' + id + '/impersonate');
    }

    async forceDelete(id) {
        return this.request('delete')
            .fetch(this.constructor.getResourceRoot() + '/' + id + '/force');
    }

    async stopImpersonating() {
        return await this.request('post')
            .fetch(API_ROOT + 'users/stop-impersonating');
    }

}
