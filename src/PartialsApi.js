import  { CrudApi } from './CrudApi';

export default class PartialsApi extends CrudApi {

    static getResourceName() {
        return 'partials';
    }

    static prepareModelForAPI(data) {
        let m = { ...data  };
        delete m.id;
        // delete m.fullPath;
        // m.parentDirectory = m.parentDirectory ? m.parentDirectory.id : null;
        // delete m.selected;
        return m;
    }

}
