import {getApiRoot} from "./CrudApi";
import {LOGIN_AGAIN_NOTIFICATION} from "./AuthApi";

export const getApiHost = () => {
    if (parseInt(window.location.port) >= 3000) {
        // for local development, Laravel should be running on port 80,
        // whereas the frontend (`npm run dev`) is running on a higher port
        return "http://localhost/";
    } else {
        return '/';
    }
}

var xsrfToken = null;

export const initCsrfCookie = async () => {
    await window.fetch(
        getApiRoot() + 'csrf-cookie',
        {
            credentials: 'same-origin'
        });
    let cookiesObj = document.cookie
        .split(';')
        .reduce((res, c) => {
            const [key, val] = c.trim().split('=').map(decodeURIComponent)
            return Object.assign(res, { [key]: val });
        }, {});
    xsrfToken = cookiesObj['XSRF-TOKEN'];
}

export class FetchBuilder {

    constructor($buefy, method) {
        this.$buefy = $buefy;
        this.method = method;
        this.headers = new Headers();
        this.body = undefined;
    }
    wantJson() {
        this.headers.set('Accept', 'application/json');
        return this;
    }
    setContentType(type) {
        this.headers.set('Content-Type', type);
        return this;
    }
    setBody(body) {
        this.body = body;
        return this;
    }
    withJson(json) {
        this.body = JSON.stringify(json);
        this.setContentType('application/json');
        return this;
    }

    withQueryParams(queryParams) {
        this.queryParams = queryParams;
        return this;
    }

    cookies() {
        this.credentials = getApiHost() === '/' ? 'same-origin' : 'include';
        return this;
    }

    async setXsrfTokenHeader() {
        if(xsrfToken === null) {
            await initCsrfCookie();
        }
        this.headers.set('X-XSRF-TOKEN', xsrfToken);
    }

    async fetchRaw(url) {
        await this.setXsrfTokenHeader()

        let v = { ... this};
        v.queryParams = undefined;

        if(this.queryParams) {
            url = new URL(url, window.location);
            for(let name in this.queryParams) {
                if(Object.prototype.hasOwnProperty.call(this.queryParams, name) && this.queryParams[name] !== null) {
                    url.searchParams.append(name, this.queryParams[name]);
                }
            }
        }

        return await window.fetch(url.toString(), this);
    }

    async fetch(url) {
        let response = await this.fetchRaw(url);

        let data = {};
        try {
            data = await response.json();
        } catch(e) {
            if(response.status === 413) {
                this.$buefy.notification.open({
                    message: 'Upload failed: file(s) too large',
                    type: 'is-danger',
                    animation: 'fade',
                    queue: false
                });
                return {};
            } else if(response.status === 204 || response.status === 404) {
                // no content, we're okay
            } else {
                console.error('Response did not contain valid JSON: ', e);
                this.$buefy.notification.open({
                    message: 'Whoops, looks like something went wrong.',
                    type: 'is-warning',
                    queue: false
                });

                throw e;
            }
        }

        if(response.ok && data.status !== 'failed') {
            return data;
        }

        await handleAPIError(data, this.$buefy, FetchBuilder.router, FetchBuilder.store, response);
        let e = new Error('Received an error response from API call');
        e.response = data;
        throw e;
    }

    static default($buefy, method) {
        return (new FetchBuilder($buefy, method))
            .cookies()
            .wantJson();
    }

    static setRouter(router) {
        FetchBuilder.router = router;
    }

    static setStore(store) {
        FetchBuilder.store = store;
    }
}

function statusToBueify(status) {
    if(status === 'failed') {
        return 'is-danger';
    } else {
        return `is-${status}`;
    }
}

export function morphToNotification(data) {
    return {
        message: data.content,
        type: statusToBueify(data.status),
        indefinite: data.duration === 'indefinite',
        duration: data.duration ? data.duration : 4000,
        queue: false
    };
}

const handleAPIError = async (content, $buefy, $router, $store, response) => {
    console.error('API error: ', content, $router);
    if(response.status === 401 && content.code === 'unauthenticated') {
        // server is telling us to login again
        await $store.commit('setUser', null);
        await initCsrfCookie();
        await $buefy.notification.open(LOGIN_AGAIN_NOTIFICATION);
        await $router.push({path: '/auth/login', query: {redirect: $router.currentRoute.fullPath}});
    } else if(response.status === 403 && content.code === 'two_factor_setup_required') {
        await $router.push({ path: '/auth/2fa-setup' });
    } else if(response.status === 403 && content.code === 'email_unverified') {
        await $router.push({ path: '/auth/needs-verified-email', query: {redirect: $router.currentRoute.fullPath } });
    } else if(response.status === 404) {
        await $router.push({ name: 'error404' });
    } else if(response.status === 429) {
        await $buefy.notification.open({
            message: 'Too many requests within a short timeframe. Please wait.',
            type: 'is-warning',
            duration: 10000,
            queue: false
        });
    } else if(typeof content.errors === 'object') {
        // handle generic validation errors
        for(const [, errors ] of Object.entries(content.errors)) {
            for(let error of errors) {
                $buefy.notification.open({
                    message: error,
                    duration: 4000,
                    queue: false,
                    type: 'is-warning'
                });
            }
        }
    } else if(content.content && content.status) {
        await $buefy.notification.open(morphToNotification(content));
    } else if(content.exception) {
        await $buefy.notification.open({
            message:
                'PHP Exception of type <pre class="no-pre">' + content.exception +
                '</pre> with message <pre class="no-pre">' + content.message +
                '</pre> thrown at <pre class="no-pre">' + content.file + ':' + content.line +
                '</pre>',
            duration: 20000,
            animation: 'fade',
            type: 'is-danger'
        });
    } else if(response.status === 500) {
        await $buefy.notification.open({
            message:'Whoops, looks like something went wrong.',
            type: 'is-danger',
            animation: 'fade',
            queue: false
        });
    }
};

export function getXsrfToken() {
    return xsrfToken;
}

FetchBuilder.router = null;
FetchBuilder.store = null;