import { titleCase } from "title-case";
import { parsePhoneNumberFromString } from "libphonenumber-js";

const convertStr = (input) => {
    if(!input) {
        return null;
    }
    return titleCase(input.trim());
};

const strEquals = (s1, s2) => {
    return s1.trim().toLowerCase() === s2.trim().toLowerCase();
};

const nestedGet = (object, key) => {
    let parts = key.split('.');

    for(let part of parts) {
        if(object === null || typeof object === 'undefined') {
            return null;
        }

        object = object[part];
    }
    
    if(typeof object === 'undefined') {
        return null;
    }

    return object;
};

const nestedSet = (object, key, value) => {
    let parts = key.split('.');

    for(let i = 0; i < parts.length; i++) {
        if(i < parts.length - 1) {
            if(object[parts[i]] === null || typeof object[parts[i]] === 'undefined') {
                object[parts[i]] = {};
            }
            object = object[parts[i]];
        } else {
            object[parts[i]] = value;
        }
    }
};

const tryParseTelephone = (telephone) => {
    if(typeof telephone !== 'string') {
        return null;
    }
    let result = parsePhoneNumberFromString(telephone, 'AU');
    if(typeof result === 'undefined' || !result.isValid()) {
        // manual fix for telephone numbers like 9123 4567 which are considered valid by most Australians
        let localPhone = telephone.replace(' ', '');
        if(localPhone.length === 8 && localPhone.match(/^\d+$/)) {
            return telephone;
        }
        return null;
    } else {
        return result.formatNational();
    }
};

const slugify = (str) => {
    if(!str) return '';
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')      // Remove non-word chars except spaces and hyphens
        .replace(/[\s_-]+/g, '-')       // Replace spaces, underscores, multiple hyphens with single hyphen
        .replace(/^-+|-+$/g, '');       // Remove leading/trailing hyphens
};

const slugifyKey = (str) => {
    if(!str) return '';
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s.-]/g, '')      // Remove non-word chars except spaces, dots, and hyphens
        .replace(/[\s_-]+/g, '.')       // Replace spaces, underscores, hyphens with dots
        .replace(/^\.+|\.+$/g, '');     // Remove leading/trailing dots
};

export { strEquals, convertStr, nestedGet, nestedSet, tryParseTelephone, slugify, slugifyKey };