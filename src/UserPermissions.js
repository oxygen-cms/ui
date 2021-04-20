// this is a straight JavaScript port of the `Oxygen\Auth\Permissions\SimplePermissionsSystem` PHP class.

import AuthApi from "./AuthApi";

export default class UserPermissions {

    static setBuefy($buefy) {
        this.$buefy = $buefy;
    }

    static get ROOT_CONTENT_TYPE() { return '_root'; }
    static get ACCESS_KEY() { return '_access'; }
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
            throw new Error('SimplePermissionsSystem Requires a Dot-Seperated Permissions Key');
        }

        // check for the access key
        if(!this.hasKey(keyParts[0], UserPermissions.ACCESS_KEY)) {
            console.warn('no access');
            return false;
        }

        // check for the specific key
        return this.hasKey(keyParts[0], keyParts[1]);
    }

    static async has(key) {
        try {
            let permissions = new UserPermissions((await (new AuthApi(this.$buefy)).userDetails()).user.permissions);
            return permissions.has(key);
        } catch(e) {
            return false;
        }
    }

    hasKey(contentType, key, depth = 0) {
        // check we're not looping
        if(depth > UserPermissions.MAX_INHERITANCE_DEPTH) {
            console.warn('Max Depth Reached due to Inheritance Loop');
            return false;
        }

        // if the key is set then we will return the value of it
        if(contentType in this.permissions && key in this.permissions[contentType]) {
            return this.permissions[contentType][key];
        } else if(contentType in this.permissions && UserPermissions.PARENT_KEY in this.permissions[contentType]) {
            // look in the parent contentType
            let parent = this.permissions[contentType][UserPermissions.PARENT_KEY];
            return this.hasKey(parent, key, depth + 1);
        } else if(UserPermissions.ROOT_CONTENT_TYPE in this.permissions && key in this.permissions[UserPermissions.ROOT_CONTENT_TYPE]) {
            // return the root content type
            return this.permissions[UserPermissions.ROOT_CONTENT_TYPE][key];
        } else {
            return false;
        }
    }

}
