// ================================
//             Notification
// ================================

import AuthApi from "./AuthApi";

const isDefined = (o) => {
    return typeof o !== 'undefined' && o !== null;
};

class UserPreferences {

    static setBuefy($buefy) {
        this.$buefy = $buefy;
    }

    static async getPrefs() {
        return (await (new AuthApi(this.$buefy)).userDetails()).user.preferences;
    }

    static async get(key, fallback = null) {
        let o = await this.getPrefs();

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

    static async has(key) {
        let o = await this.getPrefs();

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

