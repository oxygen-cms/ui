// ================================
//             Notification
// ================================

import AuthApi from "./AuthApi";

const isDefined = (o) => {
    return typeof o !== 'undefined' && o !== null;
};

class UserPreferences {

    constructor(preferences) {
        this.preferences = preferences;
    }

    static setBuefy($buefy) {
        this.$buefy = $buefy;
        this.authApi = new AuthApi(this.$buefy);
    }

    get(key, fallback = null) {
        let o = this.preferences;

        if(!isDefined(o)) {
            return fallback;
        }

        var parts = key.split('.');
        //var last = parts.pop();
        var l = parts.length;
        var i = 0;

        while(isDefined(o) && i < l) {
            var idx = parts[i];
            o = o[idx];
            i++;
        }

        if (isDefined(o)) {
            return o;
        } else {
            console.log('Preferences key ', key, 'was not defined, using default ', fallback);
            return fallback;
        }
    }

    has(key) {
        let o = this.preferences;
        if(!o) {
            return false;
        }

        var parts = key.split('.');
        var l = parts.length;
        var i = 1;
        var current = parts[0];

        while((o = o[current]) && i < l) {
            current = parts[i];
            i++;
        }

        return !!o;
    }
}

export default UserPreferences;

