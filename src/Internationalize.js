export default class Internationalize {
    static get locale() {
        // hardcoded locale for now
        return 'en-AU';
    }

    static formatDate(date) {
        let format = new Intl.DateTimeFormat(this.locale);
        if(typeof date === 'string') {
            return format.format(new Date(date));
        }
        return format.format(date);
    }

    static formatLastUpdated(updatedAt) {
        let d = new Date(updatedAt);
        return d.toDateString() + ' ' + d.toLocaleTimeString();
    }

    static formatDateTime(datetime) {
        let format = new Intl.DateTimeFormat(this.locale , {
            year: 'numeric', month: 'numeric', day: 'numeric',
            hour: 'numeric', minute: 'numeric', second: 'numeric'
        });

        if(typeof datetime === 'string') {
            return format.format(new Date(datetime));
        }
        return format.format(datetime);
    }

    static formatDateTimeRange(from, to) {
        let format = new Intl.DateTimeFormat(this.locale , {
            hour: 'numeric', minute: 'numeric'
        });

        if(from.getDate() === to.getDate() && from.getMonth() === to.getMonth() && from.getYear() === to.getYear()) {
            return this.formatDate(from) + " " + format.format(from) + " - " + format.format(to);
        } else {
            return this.formatDate(from) + " " + format.format(from) + " - " + this.formatDate(to) + format.format(to);
        }
    }
}
