// this is a straight JavaScript port of the `Oxygen\Auth\Permissions\TreePermissionsSystem` PHP class.

export default class UserPermissions {

    static setBuefy($buefy) {
        this.$buefy = $buefy;
    }

    static get ROOT_CONTENT_TYPE() { return '_root'; }
    static get PARENT_KEY() { return '_parent'; }
    static get MAX_INHERITANCE_DEPTH() { return 10; }

    constructor(permissions) {
        this.permissions = permissions;
    }

    has(key) {
        if(!this.permissions) {
            console.warn('permissions not loaded');
            return false;
        }

        let keyParts = key.split('.');

        if(keyParts.length !== 2) {
            throw new Error('TreePermissionsSystem Requires a Dot-Seperated Permissions Key: ' + key);
        }

        // check for the specific key
        // console.log(key + " = " + result);
        return this.hasKey(keyParts[0], keyParts[1]);
    }

    hasOneOf(keys) {
        for(let key of keys) {
            if(this.has(key)) {
                return true;
            }
        }
        return false;
    }

    hasKey(contentType, key, depth = 0) {
        // check we're not looping
        if(depth > UserPermissions.MAX_INHERITANCE_DEPTH) {
            throw new Error('Max Depth Reached Due to Inheritance Loop');
        }

        // if the key is set then we will return the value of it
        if(contentType in this.permissions && key in this.permissions[contentType]) {
            return this.permissions[contentType][key];
        } else {
            // look in the parent contentType
            let parent = (contentType in this.permissions && UserPermissions.PARENT_KEY in this.permissions[contentType]) ?
                this.permissions[contentType][UserPermissions.PARENT_KEY]
                : UserPermissions.ROOT_CONTENT_TYPE;

            // have already reached the root - would only lead to infinite recursion
            if(contentType === UserPermissions.ROOT_CONTENT_TYPE) {
                return false;
            }

            return this.hasKey(parent, key, depth + 1);
        }
    }

}
