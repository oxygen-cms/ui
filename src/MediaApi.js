import  { CrudApi } from './CrudApi';

export default class MediaApi extends CrudApi {

    static get TYPE_IMAGE() { return 0; }
    static get TYPE_DOCUMENT() { return 1; }
    static get TYPE_AUDIO() { return 2; }

    static getResourceName() {
        return 'media';
    }

    static prepareModelForAPI(data) {
        let m = { ...data  };
        delete m.id;
        delete m.filename;
        delete m.extension;
        m.parentDirectory = m.parentDirectory ? m.parentDirectory.id : null;
        delete m.selected;
        return m;
    }

    async create(data) {
        let request = this.request('post');
        let formData = new FormData();
        for(let file of data.files) {
            formData.append('file[]', file);
        }
        if(data.currentDirectory !== null) {
            formData.append('parentDirectory', data.currentDirectory.id);
        }
        return request.setBody(formData)
            .fetch(this.constructor.getResourceRoot());
    }

    async list(inTrash, searchQuery, page, path) {
        return this.request('get')
            .withQueryParams({
                path: path,
                q: (searchQuery !== null && searchQuery !== '' ) ? searchQuery : null,
                page: page,
                trash: (inTrash ? 'true' : 'false'),
            })
            .fetch(this.constructor.getResourceRoot());
    }

    static generateIncludeStatement(item) {
        let fullPathNoExt = item.fullPath.split('.')[0];
        return '{{ media(\'' + fullPathNoExt + '\') }}';
    }

}
