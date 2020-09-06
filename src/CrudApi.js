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

    static list(inTrash, page, searchQuery, callback) {
        return FetchBuilder
            .default('get')
            .withQueryParams({
                page: page,
                trash: (inTrash ? 'true' : 'false'),
                q: (searchQuery !== null && searchQuery !== '' ) ? searchQuery : null
            })
            .fetch(
                this.getResourceRoot(),
                callback
            );
    }

    static create(data, callback) {
        return FetchBuilder
            .default('post')
            .withJson(this.prepareModelForAPI(data))
            .fetch(this.getResourceRoot(), callback);
    }

    static get(id, callback) {
        return FetchBuilder
            .default('get')
            .fetch(this.getResourceRoot() + '/' + id, callback);
    }

    static update(data, callback) {
        let id = data.id;
        return FetchBuilder
            .default('put')
            .withJson(this.prepareModelForAPI(data))
            .fetch(this.getResourceRoot() + '/' + id, callback);
    }

    static delete(id, callback) {
        return FetchBuilder
            .default('delete')
            .fetch(this.getResourceRoot() + '/' + id, callback);
    }

    static search(searchQuery, callback) {
        return FetchBuilder.default('post')
            .withJson(searchQuery)
            .fetch(this.getResourceRoot() + '/search', callback);
    }

    static forceDelete(id, callback) {
        return FetchBuilder
            .default('delete')
            .fetch(this.getResourceRoot() + '/' + id + '?force=true', callback);
    }

    static confirmForceDelete(id, callback) {
        Dialog.confirm({
            message: 'Are you sure you want to delete this record forever?',
            onConfirm: () => {
                this.forceDelete(id, (data) => {
                    Toast.open(morphToNotification(data));
                    callback(data);
                });
            }
        });
    }

    static restoreAndNotify(id, callback) {
        return FetchBuilder
            .default('post')
            .fetch(this.getResourceRoot() + '/' + id + '/restore', (data) => {
                Toast.open(morphToNotification(data));
                callback(data);
            });
    }

    static deleteAndNotify(id, callback) {
        this.delete(id, (data) => {
            Toast.open(morphToNotification(data));
            callback(data);
        });
    }
}

export { CrudApi, API_ROOT };