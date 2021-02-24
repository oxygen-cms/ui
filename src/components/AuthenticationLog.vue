<template>
    <div>
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
                <b-table-column label="IP Address" v-slot="props">
                    {{ props.row.ipAddress }}
                </b-table-column>

                <b-table-column label="Location" v-slot="props">
                    <div v-if="props.row.geolocationInfo !== null">
                        {{ props.row.geolocationInfo }}
                    </div>
                    <b-progress v-else></b-progress>

                </b-table-column>

                <b-table-column label="Browser / Device" v-slot="props">
                    <b-tooltip :label="props.row.userAgent" animated>{{ parseUserAgent(props.row.userAgent) }}</b-tooltip>

                </b-table-column>

                <b-table-column label="Time" v-slot="props">
                    {{ Internationalize.formatDateTime(props.row.timestamp) }}
                </b-table-column>

                <b-table-column label="Type" v-slot="props">
                    {{ getInfo(props.row) }}
                </b-table-column>
            </b-table>
        </div>
    </div>
</template>

<script>
import {FetchBuilder} from "../api";
import Internationalize from "../Internationalize";
import UAParser from 'ua-parser-js';

const IP_INFO_LOADING = 'loading';

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
        async fetchData() {
            this.paginatedItems.loading = true;
            let data = await FetchBuilder
                .default(this.$buefy, 'post')
                .withQueryParams({ page: this.paginatedItems.currentPage })
                .fetch('/oxygen/api/auth/login-log-entries');

            this.paginatedItems.items = data.items.map((item) => { return { geolocationInfo: this.ipInfo.get(item.ip), ...item } });
            this.paginatedItems.totalItems = data.totalItems;
            this.paginatedItems.loading = false;
            this.paginatedItems.itemsPerPage = data.itemsPerPage;
            for(let item of this.paginatedItems.items) {
                this.geoIP(item.ipAddress);
            }
        },
        geoIP(ip) {
            if(this.ipInfo.has(ip)) {
                if(this.ipInfo.get(ip) !== IP_INFO_LOADING) {
                    this.updateInfoForIp(ip);
                }
                return;
            }
            this.ipInfo.set(ip, IP_INFO_LOADING);
            FetchBuilder.default(this.$buefy, 'post')
                .fetch('/oxygen/api/auth/ip-location/' + ip, (data) => data)
                .then((data) => {
                    this.ipInfo.set(ip, data);
                    this.updateInfoForIp(ip);
                }).catch(() => {
                    this.updateInfoForIp(ip);
                })
        },
        updateInfoForIp(ip) {
            let geolocationInfo = this.ipInfo.has(ip) ? this.getGeolocationInfo(this.ipInfo.get(ip)) : '';
            for(let item of this.paginatedItems.items) {
                if(item.ipAddress === ip) {
                    item.geolocationInfo = geolocationInfo;
                }
            }
        },
        parseUserAgent(userAgent) {
            let ua = new UAParser(userAgent);
            let browser = ua.getBrowser();
            let device = ua.getDevice();
            // console.log(device);
            return browser.name + ' ' + browser.version + ' on ' + ua.getOS().name + ', ' + (device.vendor ? device.vendor : '(unknown device)');
        },
        getGeolocationInfo(data) {
            if(!data.city || !data.country_name) {
                return 'unknown';
            }
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
