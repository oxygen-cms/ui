import {FetchBuilder} from './api.js';
import {morphToNotification} from "./api";

const API_ROOT = '/oxygen/api/';

class CrudApi {

    constructor($buefy) {
        this.$buefy = $buefy;
    }

    request(method) {
        return FetchBuilder.default(this.$buefy, method);
    }

    static getResourceName() {
        throw new Error();
    }

    static getResourceRoot() {
        return API_ROOT + this.getResourceName();
    }

    static prepareModelForAPI(data) {
        let m = { ...data  };
        delete m.id;
        return m;
    }

    async list(inTrash, page, searchQuery) {
        return this.request('get')
            .withQueryParams({
                page: (searchQuery !== null && searchQuery !== '' ) ? null : page,
                trash: (inTrash ? 'true' : 'false'),
                q: (searchQuery !== null && searchQuery !== '' ) ? searchQuery : null
            })
            .fetch(this.constructor.getResourceRoot());
    }

    async create(data) {
        return this.request('post')
            .withJson(this.constructor.prepareModelForAPI(data))
            .fetch(this.constructor.getResourceRoot());
    }

    async get(id) {
        return this.request('get')
            .fetch(this.constructor.getResourceRoot() + '/' + id);
    }

    async update(data) {
        let id = data.id;
        return this.request('put')
            .withJson(this.constructor.prepareModelForAPI(data))
            .fetch(this.constructor.getResourceRoot() + '/' + id);
    }

    async delete(id) {
        return this.request('delete')
            .fetch(this.constructor.getResourceRoot() + '/' + id);
    }

    async search(searchQuery) {
        return this.request('post')
            .withJson(searchQuery)
            .fetch(this.constructor.getResourceRoot() + '/search');
    }

    async forceDelete(id, callback) {
        return this.request('delete')
            .fetch(this.constructor.getResourceRoot() + '/' + id + '?force=true');
    }

    async confirmForceDelete(id) {
        const promise = new Promise((resolve, reject) => {
            this.$buefy.dialog.confirm({
                message: 'Are you sure you want to delete this record forever?',
                onConfirm: resolve
            });
        });

        let result = await promise;
        let data = await this.forceDelete(id);
        this.$buefy.toast.open(morphToNotification(data));
        return data;
    }

    async restoreAndNotify(id) {
        let data = await this.request('post')
            .fetch(this.constructor.getResourceRoot() + '/' + id + '/restore');
        this.$buefy.toast.open(morphToNotification(data));
        return data;
    }

    async deleteAndNotify(id) {
        let data = await this.delete(id);
        this.$buefy.toast.open(morphToNotification(data));
        return data;
    }

    async listVersions(id) {
        return this.request('get')
            .fetch(this.constructor.getResourceRoot() + '/' + id + '/versions');
    }

    async makeHeadVersion(id) {
        return this.request('post')
            .fetch(this.constructor.getResourceRoot() + '/' + id + '/make-head');
    }
}

export { CrudApi, API_ROOT };
