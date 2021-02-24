const getCSRFToken = () => {
    let csrfTokenNode = document.querySelector('meta[name="csrf-token"]');
    if(csrfTokenNode === null) {
        return null;
    }
    return csrfTokenNode.attributes.content.nodeValue;
};

class FetchBuilder {
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

            this.$buefy.notification.open({
                message: 'Whoops, looks like something went wrong.',
                type: 'is-warning'
            });

            throw e;
        }

        if(!response.ok || (data.status && data.status === 'failed')) {
            handleAPIError(data, this.$buefy);
            let e = new Error();
            e.response = data;
            throw e;
        } else {
            return data;
        }
    }

    static default($buefy, method) {
        return (new FetchBuilder($buefy, method))
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
        indefinite: !data.duration,
        duration: data.duration,
        queue: false
    };
}

const handleAPIError = function(content, $buefy) {
    console.error('API error: ', content);
    if(content.authenticated === false) {
        // server is telling us to login again
        window.location.replace('/oxygen/auth/login?intended=' + window.location);
        return;
    }

    if(content.content && content.status) {
        $buefy.notification.open(morphToNotification(content));
    } else if(content.error) {
        $buefy.notification.open({
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
        $buefy.notification.open({
            message:'Whoops, looks like something went wrong.',
            type: 'is-danger',
            animation: 'fade',
            queue: false
        });
    }
};

export { FetchBuilder, morphToNotification, getCSRFToken };
