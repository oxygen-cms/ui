import {FetchBuilder} from './api.js';
import {morphToNotification} from "./api";

const API_ROOT = '/oxygen/api/';

class CrudApi {

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

    static async list(inTrash, page, searchQuery) {
        return FetchBuilder
            .default('get')
            .withQueryParams({
                page: page,
                trash: (inTrash ? 'true' : 'false'),
                q: (searchQuery !== null && searchQuery !== '' ) ? searchQuery : null
            })
            .fetch(this.getResourceRoot());
    }

    static async create(data) {
        return FetchBuilder
            .default('post')
            .withJson(this.prepareModelForAPI(data))
            .fetch(this.getResourceRoot());
    }

    static async get(id) {
        return FetchBuilder
            .default('get')
            .fetch(this.getResourceRoot() + '/' + id);
    }

    static async update(data) {
        let id = data.id;
        return FetchBuilder
            .default('put')
            .withJson(this.prepareModelForAPI(data))
            .fetch(this.getResourceRoot() + '/' + id);
    }

    static async delete(id) {
        return FetchBuilder
            .default('delete')
            .fetch(this.getResourceRoot() + '/' + id);
    }

    static async search(searchQuery) {
        return FetchBuilder.default('post')
            .withJson(searchQuery)
            .fetch(this.getResourceRoot() + '/search');
    }

    static async forceDelete(id, callback) {
        return FetchBuilder
            .default('delete')
            .fetch(this.getResourceRoot() + '/' + id + '?force=true');
    }

    static async confirmForceDelete(id, $buefy) {
        const promise = new Promise((resolve, reject) => {
            $buefy.dialog.confirm({
                message: 'Are you sure you want to delete this record forever?',
                onConfirm: resolve
            });
        });

        let result = await promise;
        let data = await this.forceDelete(id);
        $buefy.toast.open(morphToNotification(data));
        return data;
    }

    static async restoreAndNotify(id, $buefy) {
        let data = await FetchBuilder
            .default('post')
            .fetch(this.getResourceRoot() + '/' + id + '/restore');
        $buefy.toast.open(morphToNotification(data));
        return data;
    }

    static async deleteAndNotify(id, $buefy) {
        let data = await this.delete(id);
        $buefy.toast.open(morphToNotification(data));
        return data;
    }
}

export { CrudApi, API_ROOT };
