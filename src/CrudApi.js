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

    /**
     * Determines if a model has unsaved changes compared to the server version.
     * Can be overridden by subclasses to check specific fields.
     *
     * @param {Object} model - The current model state
     * @param {Object} serverModel - The original model from the server
     * @returns {boolean}
     */
    static isDirty(model, serverModel) {
        if (!model || !serverModel) return false;

        // Get all fillable fields from the model
        const fillableFields = this.prepareModelForAPI(model);
        const fieldsToCheck = Object.keys(fillableFields);

        // Also check common fields that might not be in prepareModelForAPI
        const commonFields = ['content', 'title', 'description', 'stage'];
        const allFields = new Set([...fieldsToCheck, ...commonFields]);

        for (const field of allFields) {
            const modelValue = model[field];
            const serverValue = serverModel[field];

            // Handle arrays/objects with JSON comparison
            if (typeof modelValue === 'object' && modelValue !== null) {
                if (JSON.stringify(modelValue) !== JSON.stringify(serverValue)) {
                    return true;
                }
            } else {
                // Simple value comparison
                if (modelValue !== serverValue) {
                    return true;
                }
            }
        }

        return false;
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