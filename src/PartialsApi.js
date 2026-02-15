import  { CrudApi } from './CrudApi';

export default class PartialsApi extends CrudApi {

    static STAGE_DRAFT = 0;
    static STAGE_PUBLISHED = 1;

    static getResourceName() {
        return 'partials';
    }

    static prepareModelForAPI(data) {
        let m = { ...data  };
        delete m.id;
        delete m.stage;
        delete m.headVersion;
        delete m.createdAt;
        delete m.updatedAt;
        delete m.deletedAt;
        delete m.createdBy;
        delete m.updatedBy;
        return m;
    }

    async list({ inTrash, page, q, sortField, sortOrder }) {
        return this.request('get')
            .withQueryParams({
                page: (q !== null && q !== '' ) ? null : page,
                trash: (inTrash ? 'true' : 'false'),
                q: (q !== null && q !== '' ) ? q : null,
                sortField,
                sortOrder
            })
            .fetch(this.constructor.getResourceRoot());
    }

}
