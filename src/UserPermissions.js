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

    static async has(key) {
        let permissions;
        try {
            permissions = (await (new AuthApi(this.$buefy)).userDetails()).user.permissions;
        } catch(e) {
            return false;
        }

        let keyParts = key.split('.');

        if(keyParts.length !== 2) {
            throw new Error('SimplePermissionsSystem Requires a Dot-Seperated Permissions Key');
        }

        // check for the access key
        if(!this.hasKey(permissions, keyParts[0], this.ACCESS_KEY)) {
            return false;
        }

        // check for the specific key
        return this.hasKey(permissions, keyParts[0], keyParts[1]);
    }

    static hasKey(permissions, contentType, key, depth = 0) {
        // check we're not looping
        if(depth > this.MAX_INHERITANCE_DEPTH) {
            console.warn('Max Depth Reached due to Inheritance Loop');
            return false;
        }

        // if the key is set then we will return the value of it
        if(contentType in permissions && key in permissions[contentType]) {
            return permissions[contentType][key];
        } else if(contentType in permissions && this.PARENT_KEY in permissions[contentType]) {
            // look in the parent contentType
            let parent = permissions[contentType][this.PARENT_KEY];
            return this.hasKey(permissions, parent, key, depth + 1);
        } else if(this.ROOT_CONTENT_TYPE in permissions && key in permissions[this.ROOT_CONTENT_TYPE]) {
            // return the root content type
            return permissions[this.ROOT_CONTENT_TYPE][key];
        } else {
            return false;
        }
    }

}
