import {FetchBuilder} from './api.js';
import { DialogProgrammatic as Dialog, ToastProgrammatic as Toast } from 'buefy';
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

    static async confirmForceDelete(id) {
        const promise = new Promise((resolve, reject) => {
            Dialog.confirm({
                message: 'Are you sure you want to delete this record forever?',
                onConfirm: resolve
            });
        });

        let result = await promise;
        let data = await this.forceDelete(id);
        Toast.open(morphToNotification(data));
        return data;
    }

    static async restoreAndNotify(id) {
        let data = await FetchBuilder
            .default('post')
            .fetch(this.getResourceRoot() + '/' + id + '/restore');
        Toast.open(morphToNotification(data));
        return data;
    }

    static async deleteAndNotify(id) {
        let data = await this.delete(id);
        Toast.open(morphToNotification(data));
        return data;
    }
}

export { CrudApi, API_ROOT };
