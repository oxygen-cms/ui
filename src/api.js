import { NotificationProgrammatic as Notification } from 'buefy';

const getCSRFToken = () => {
    return document.querySelector('meta[name="csrf-token"]').attributes.content.nodeValue;
};

class FetchBuilder {
    constructor(method) {
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
        this.setContentType('application/json')
        return this;
    }

    withQueryParams(queryParams) {
        this.queryParams = queryParams;
        return this;
    }

    withCsrfToken() {
        this.headers.set('X-CSRF-TOKEN', getCSRFToken());
        return this;
    }

    cookies() {
        this.credentials = 'same-origin';
        return this;
    }

    async fetch(url) {
        let v = { ... this};
        v.queryParams = undefined;

        if(this.queryParams) {
            url = new URL(url, window.location);
            for(let name in this.queryParams) {
                if(this.queryParams.hasOwnProperty(name) && this.queryParams[name] !== null) {
                    url.searchParams.append(name, this.queryParams[name]);
                }
            }
        }

        let response = await window.fetch(url.toString(), this);

        let data;
        try {
            data = await response.json();
        } catch(e) {
            console.error('Response did not contain valid JSON: ', e);

            Notification.open({
                message: 'Whoops, looks like something went wrong.',
                type: 'is-warning'
            });

            throw e;
        }

        if(!response.ok || (data.status && data.status === 'failed')) {
            handleAPIError(data);
            let e = new Error();
            e.response = data;
            throw e;
        } else {
            return data;
        }
    }

    static default(method) {
        return (new FetchBuilder(method))
            .cookies()
            .withCsrfToken()
            .wantJson();
    }
}

function statusToBueify(status) {
    if(status === 'failed') {
        return 'is-danger';
    } else {
        return `is-${status}`;
    }
}

function morphToNotification(data) {
    return {
        message: data.content,
        type: statusToBueify(data.status),
        indefinite: true,
        queue: false
    };
}

const handleAPIError = function(content) {
    console.error('API error: ', content);
    if(content.authenticated === false) {
        // server is telling us to login again
        window.location.replace('/oxygen/auth/login?intended=' + window.location);
        return;
    }

    if(content.content && content.status) {
        Notification.open(morphToNotification(content));
    } else if(content.error) {
        Notification.open({
            message:
                'PHP Exception of type <pre class="no-pre">' + content.error.type +
                '</pre> with message <pre class="no-pre">' + content.error.message +
                '</pre> thrown at <pre class="no-pre">' + content.error.file + ':' + content.error.line +
                '</pre>',
            duration: 20000,
            animation: 'fade',
            type: 'is-danger'
        });
    } else {
        Notification.open({
            message:'Whoops, looks like something went wrong.',
            type: 'is-danger',
            animation: 'fade',
            queue: false
        });
    }
};

export { FetchBuilder, morphToNotification, getCSRFToken };
