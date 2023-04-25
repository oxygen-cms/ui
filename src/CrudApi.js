import {FetchBuilder, getApiHost} from './api.js';
import {morphToNotification} from "./api";

const API_ROOT = 'oxygen/api/';

export const getApiRoot = () => {
    return getApiHost() + API_ROOT;
}

export class CrudApi {

    static setBuefy($buefy) {
        this.$buefy = $buefy;
    }

    request(method) {
        if(!CrudApi.$buefy) { throw new Error("need to call setBuefy() first"); }
        return FetchBuilder.default(CrudApi.$buefy, method);
    }

    static getResourceName() {
        throw new Error();
    }

    static getResourceRoot() {
        return getApiRoot() + this.getResourceName();
    }

    static prepareModelForAPI(data) {
        let m = { ...data  };
        delete m.id;
        return m;
    }

    static convertModelFromAPI(data) {
        return data;
    }

    async list({ inTrash, page, q, sortField, sortOrder }) {
        return this.request('get')
            .withQueryParams({
                page: (q !== null && q !== '' ) ? null : page,
                sortField: sortField,
                sortOrder: sortOrder,
                trash: (inTrash ? 'true' : 'false'),
                q: (q !== null && q !== '' ) ? q : null
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

    async forceDelete(id) {
        return this.request('delete')
            .fetch(this.constructor.getResourceRoot() + '/' + id + '?force=true');
    }

    async confirmForceDelete(id) {
        const promise = new Promise((resolve) => {
            CrudApi.$buefy.dialog.confirm({
                message: 'Are you sure you want to delete this record forever?',
                onConfirm: resolve
            });
        });

        await promise;
        let data = await this.forceDelete(id);
        CrudApi.$buefy.toast.open(morphToNotification(data));
        return data;
    }

    async restoreAndNotify(id) {
        let data = await this.request('post')
            .fetch(this.constructor.getResourceRoot() + '/' + id + '/restore');
        CrudApi.$buefy.toast.open(morphToNotification(data));
        return data;
    }

    async deleteAndNotify(id) {
        let data = await this.delete(id);
        CrudApi.$buefy.toast.open(morphToNotification(data));
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

    async publish(id) {
        let data = await this.request('post').fetch(this.constructor.getResourceRoot() + '/' + id + '/publish');
        CrudApi.$buefy.toast.open(morphToNotification(data));
        return data.item;
    }

}