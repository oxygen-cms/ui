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

    fetch(url, callback) {
        
        let v = { ... this};
        v.queryParams = undefined;

        if(this.queryParams) {
            url = new URL(url, window.location);
            for(let name in this.queryParams) {
                if(this.queryParams[name] !== null) {
                    url.searchParams.append(name, this.queryParams[name]);
                }
            }
        }

        return window.fetch(url.toString(), this)
            .then(respond.checkStatus)
            .then(respond.json)
            .then(respond.checkNotificationStatus)
            .then(callback)
            .catch(respond.handleAPIError);
    }

    static default(method) {
        return (new FetchBuilder(method))
            .cookies()
            .withCsrfToken()
            .wantJson();
    }
}

const respond = {
    text: function (response) {
        return response.text();
    },

    json: function (response) {
        return response.json();
    },
    
    checkNotificationStatus: function (data) {
        if(data.status && data.status === 'failed') {
            let error = new Error();
            error.data = data;
            throw error;
        } else {
            return data;
        }
    },

    checkStatus: function (response) {
        if (response.ok) {
            return response;
        } else {
            let error = new Error();
            error.response = response;
            throw error;
            /*.catch(error => {
                response.text().then(text => {
                    Oxygen.error.jsonParseError(error, text);
                });
                throw error;
            })*/
        }
    },

    handleAPIError: function (error) {
        if(error.data) {
            handleAPIError(error.data);
        } else if (error.response && error.response instanceof Response) {
            error.response
                .json()
                .then(handleAPIError)
                .catch(err => {
                    console.error('Error response did not contain valid JSON: ', err);

                    Notification.open({
                        message: 'Whoops, looks like something went wrong.',
                        type: 'is-warning'
                    });
                });
        } else {
            throw error;
        }
    }

};

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

export { FetchBuilder, respond, handleAPIError, morphToNotification, getCSRFToken };
