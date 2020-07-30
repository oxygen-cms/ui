<template>
    <div>
        <section class="section">
            <div class="container">
                <div class="box">
                    <h1 class="title">Logins, Logouts &amp; Login Attempts</h1>

                    <b-table :data="paginatedItems.items === null ? [] : paginatedItems.items"
                             :loading="paginatedItems.loading"
                             paginated
                             backend-pagination
                             :per-page="paginatedItems.itemsPerPage"
                             :total="paginatedItems.totalItems"
                             :row-class="(row) => row.type === 1 ? 'is-danger' : ''"
                             @page-change="paginatedItems.currentPage = $event">
                        <template slot-scope="props">
                            <b-table-column label="IP Address">
                                {{ props.row.ipAddress }}
                            </b-table-column>

                            <b-table-column label="Location">
                                <div v-if="props.row.geolocationInfo !== null">
                                    {{ props.row.geolocationInfo }}
                                </div>
                                <b-progress v-else></b-progress>

                            </b-table-column>

                            <b-table-column label="Browser / Device">
                                <b-tooltip :label="props.row.userAgent" animated>{{ parseUserAgent(props.row.userAgent) }}</b-tooltip>

                            </b-table-column>

                            <b-table-column label="Time">
                                {{ Internationalize.formatDateTime(props.row.timestamp) }}
                            </b-table-column>

                            <b-table-column label="Type">
                                {{ getInfo(props.row) }}
                            </b-table-column>
                         </template>
                    </b-table>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import {FetchBuilder} from "../api";
import Internationalize from "../Internationalize";
import UAParser from 'ua-parser-js';

export default {
    name: "AuthenticationLog",
    data() {
        return {
            paginatedItems: { items: null, currentPage: 1, loading: true, totalItems: null, itemsPerPage: null },
            ipInfo: new Map(),
            Internationalize
        }
    },
    watch: {
        'paginatedItems.currentPage': 'fetchData'
    },
    created() {
        this.fetchData()
    },
    methods: {
        fetchData() {
            this.paginatedItems.loading = true;
            FetchBuilder
                .default('post')
                .withQueryParams({ page: this.paginatedItems.currentPage })
                .fetch('/oxygen/api/auth/login-log-entries', (data) => {
                    this.paginatedItems.items = data.items.map((item) => { return { geolocationInfo: this.ipInfo.get(item.ip), ...item } });
                    this.paginatedItems.totalItems = data.totalItems;
                    this.paginatedItems.loading = false;
                    this.paginatedItems.itemsPerPage = data.itemsPerPage;
                    for(let item of this.paginatedItems.items) {
                        this.geoIP(item.ipAddress);
                    }
                })
        },
        geoIP(ip) {
            if(this.ipInfo.has(ip)) {
                return;
            }
            this.ipInfo.set(ip, 'loading');
            FetchBuilder.default('post')
                .fetch('/oxygen/api/auth/ip-location/' + ip, (data) => data)
                .then((data) => {
                    this.ipInfo.set(ip, data);
                    for(let item of this.paginatedItems.items) {
                        if(item.ipAddress === ip) {
                            item.geolocationInfo = this.getGeolocationInfo(data);
                        }
                    }
                }).catch(() => {
                    for(let item of this.paginatedItems.items) {
                        if(item.ipAddress === ip) {
                            item.geolocationInfo = '';
                        }
                    }
                })
        },
        parseUserAgent(userAgent) {
            let ua = new UAParser(userAgent);
            let browser = ua.getBrowser();
            let device = ua.getDevice();
            // console.log(device);
            return browser.name + ' ' + browser.version + ' on ' + ua.getOS().name + ', ' + (device.vendor ? device.vendor : '(unknown device)');
        },
        getGeolocationInfo(data) {
            return data.city + ', ' + data.country_name;
        },
        getInfo(data) {
            if(data.type === 0) {
                return 'Login';
            } else if(data.type === 1) {
                return 'Login Failed';
            } else if(data.type === 2) {
                return 'Logout';
            }
        }
    }
}
</script>

<style>
    tr.is-danger {
        color: #f00;
    }
</style>