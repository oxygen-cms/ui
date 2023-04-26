import  { CrudApi } from './CrudApi';
import {getApiHost} from "./api.js";

export default class PagesApi extends CrudApi {

    static STAGE_DRAFT = 0;
    static STAGE_PENDING_REVIEW = 1;
    static STAGE_PUBLISHED = 2;
    static STAGE_ARCHIVED = 3;

    static getResourceName() {
        return 'pages';
    }

    static prepareModelForAPI(data) {
        let m = { ...data  };
        delete m.id;
        delete m.createdAt;
        delete m.updatedAt;
        delete m.deletedAt;
        delete m.createdBy;
        delete m.updatedBy;
        delete m.headVersion;
        return m;
    }

    static slugToUrl(slug) {
        return getApiHost() + slug.trimStart('/');
    }

    async list({ inTrash, page, q, path, sortField, sortOrder }) {
        if(!path) {
            path = q ? null : '/';
        }
        return this.request('get')
            .withQueryParams({
                path: path,
                page: (q !== null && q !== '' ) ? null : page,
                trash: (inTrash ? 'true' : 'false'),
                q: (q !== null && q !== '' ) ? q : null,
                sortField,
                sortOrder
            })
            .fetch(this.constructor.getResourceRoot());
    }

}
