import  { CrudApi } from './CrudApi';

export default class EventsApi extends CrudApi {

    static prepareModelForAPI(data) {
        let m = { ...data  };
        delete m.id;
        delete m.bookings;
        return m;
    }

    static getResourceName() {
        return 'upcoming-events';
    }

}
