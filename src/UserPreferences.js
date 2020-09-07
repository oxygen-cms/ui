// ================================
//             Notification
// ================================

const isDefined = (o) => {
    return typeof o !== 'undefined' && o !== null;
};

class UserPreferences {

    static get(key, fallback = null) {
        if(!isDefined(UserPreferences.preferences)) {
            UserPreferences.preferences = window.OXYGEN_USER_PREFERENCES;
        }
        
        var o = UserPreferences.preferences;

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

    static has(key) {
        if(!isDefined(UserPreferences.preferences)) {
            UserPreferences.preferences = window.OXYGEN_USER_PREFERENCES;
        }
        var o = UserPreferences.preferences;

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

