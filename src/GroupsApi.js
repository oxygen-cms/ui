import {CrudApi} from './CrudApi';

export default class GroupsApi extends CrudApi {

    static getResourceName() {
        return 'groups';
    }

}
