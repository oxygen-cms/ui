<template>
    <div class="full-height scroll-container pad">
        <div class="box">
          <h1 class="title">Active Sessions <b-button icon-left="redo-alt" rounded @click="fetchSessions"></b-button>
          </h1>


          <b-table :data="sessions.items === null ? [] : sessions.items"
                   :loading="sessions.loading">
            <b-table-column v-slot="props" label="Browser / Device">
              <b-tooltip :label="props.row.userAgent" animated>{{ parseUserAgent(props.row.userAgent) }}</b-tooltip>
            </b-table-column>

            <b-table-column v-slot="props" label="IP Address">
              {{ props.row.ipAddress }}
            </b-table-column>

            <b-table-column v-slot="props" label="Location">
              <div v-if="props.row.geolocationInfo !== null">
                {{ props.row.geolocationInfo }}
              </div>
              <b-progress v-else></b-progress>
            </b-table-column>

            <b-table-column v-slot="props" label="Last Activity">
              {{ Internationalize.formatDateTime(props.row.lastActivity) }}
            </b-table-column>

            <b-table-column v-slot="props" label="">
              <b-tag v-if="props.row.current" type="is-success" style="text-transform: uppercase">Current Session</b-tag>
              <b-button v-else size="is-small" type="is-warning" icon-left="sign-out-alt" @click="deleteSession(props.row.id)">Remove session</b-button>
            </b-table-column>
          </b-table>
        </div>

        <div class="box">
            <h1 class="title">Logins, Logouts &amp; Login Attempts <b-button icon-left="redo-alt" rounded @click="paginatedItems.currentPage = 1; fetchLogins"></b-button></h1>

            <b-table :data="paginatedItems.items === null ? [] : paginatedItems.items"
                     :loading="paginatedItems.loading"
                     paginated
                     backend-pagination
                     :per-page="paginatedItems.itemsPerPage"
                     :total="paginatedItems.totalItems"
                     :row-class="(row) => row.type === 1 ? 'is-danger' : ''"
                     @page-change="paginatedItems.currentPage = $event">
                <b-table-column v-slot="props" label="IP Address">
                    {{ props.row.ipAddress }}
                </b-table-column>

                <b-table-column v-slot="props" label="Location">
                    <div v-if="props.row.geolocationInfo !== null">
                        {{ props.row.geolocationInfo }}
                    </div>
                    <b-progress v-else></b-progress>

                </b-table-column>

                <b-table-column v-slot="props" label="Browser / Device">
                    <b-tooltip :label="props.row.userAgent" animated>{{ parseUserAgent(props.row.userAgent) }}</b-tooltip>

                </b-table-column>

                <b-table-column v-slot="props" label="Time">
                    {{ Internationalize.formatDateTime(props.row.timestamp) }}
                </b-table-column>

                <b-table-column v-slot="props" label="Type">
                    <span v-if="props.row.type === 0">
                      <b-tag type="is-success is-light"><b-icon icon="sign-in-alt" /> Login</b-tag>
                    </span>
                    <span v-else-if="props.row.type === 1">
                      <b-tag type="is-danger is-light"><b-icon icon="exclamation-triangle" /> Failed Login</b-tag>
                    </span>
                    <span v-else-if="props.row.type === 2">
                      <b-tag><b-icon icon="sign-out-alt" /> Logout</b-tag>
                    </span>
                </b-table-column>
            </b-table>
        </div>
    </div>
</template>

<script>
import {FetchBuilder} from "../api";
import Internationalize from "../Internationalize";
import UAParser from 'ua-parser-js';
import AuthApi from "../AuthApi";

const IP_INFO_LOADING = 'loading';

export default {
    name: "AuthenticationLog",
    data() {
        return {
            authApi: new AuthApi(this.$buefy),
            paginatedItems: { items: null, currentPage: 1, loading: true, totalItems: null, itemsPerPage: null },
            sessions: { items: null, loading: true },
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
        async fetchSessions() {
          this.sessions.loading = true;
          let response = await this.authApi.listUserSessions();
          this.sessions.items = response.sessions.map((item) => { return { geolocationInfo: this.ipInfo.get(item.ipAddress), ...item } });
          this.sessions.loading = false;
          for(let item of this.sessions.items) {
            this.geoIP(item.ipAddress);
          }
        },
        async fetchLogins() {
          this.paginatedItems.loading = true;
          let data = await FetchBuilder
              .default(this.$buefy, 'post')
              .withQueryParams({ page: this.paginatedItems.currentPage })
              .fetch('/oxygen/api/auth/login-log-entries');

          this.paginatedItems.items = data.items.map((item) => { return { geolocationInfo: this.ipInfo.get(item.ipAddress), ...item } });
          this.paginatedItems.totalItems = data.totalItems;
          this.paginatedItems.loading = false;
          this.paginatedItems.itemsPerPage = data.itemsPerPage;
          for(let item of this.paginatedItems.items) {
            this.geoIP(item.ipAddress);
          }
        },
        async fetchData() {
            await Promise.all([this.fetchSessions(), this.fetchLogins()]);
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
            for(let item of (this.paginatedItems.items || [])) {
                if(item.ipAddress === ip) {
                    item.geolocationInfo = geolocationInfo;
                }
            }
            for(let item of (this.sessions.items || [])) {
              if(item.ipAddress === ip) {
                item.geolocationInfo = geolocationInfo;
              }
            }
        },
        parseUserAgent(userAgent) {
            let ua = new UAParser(userAgent);
            let browser = ua.getBrowser();
            let device = ua.getDevice();
            return browser.name + ' ' + browser.version + ' on ' + ua.getOS().name + ', ' + (device.vendor ? device.vendor : '(unknown device)');
        },
        getGeolocationInfo(data) {
            if(!data.city || !data.country_name) {
                return 'unknown';
            }
            return data.city + ', ' + data.country_name;
        },
        async deleteSession(id) {
            await this.authApi.deleteUserSession(id);
            this.$buefy.notification.open({ message: 'User session removed', type: 'is-warning' });
            await this.fetchData();
        }
    }
}
</script>

<style scoped>
    @import './util.css';

    tr.is-danger {
        color: #f00;
    }
</style>
