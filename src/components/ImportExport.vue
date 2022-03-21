<template>
    <div class="content">
      <h3>Export Data</h3>
      <p>
        Create a backup of all the content and settings of the website.<br>
        It is recommended to make regular backups to ensure the safety of your content.
      </p>
      <b-button type="is-primary" size="is-medium" :loading="exporting" @click="processDownload">Download data as `.zip`</b-button>

      <h3>Import Data</h3>
      <p>To restore the contents and settings of this site from a backup, use the Artisan Console.</p>
    </div>
</template>

<script>
import {FetchBuilder} from "../api";
import {getApiRoot} from "../CrudApi";
import download from "downloadjs";

export default {
    name: "ImportExport",
    data() {
        return {
            exporting: false
        }
    },
    methods: {
        async processDownload() {
            this.exporting = true;
            let response = await (new FetchBuilder(this.$buefy, 'post'))
                .cookies()
                .fetchRaw(getApiRoot() + "import-export/export");
            this.$buefy.notification.open({ message: 'Export successful', type: 'is-success', queue: false });
            let blob = await response.blob();
            download(blob, 'database ' + (new Date()).toLocaleString() + '.zip');
            this.exporting = false;
        }
    }
}
</script>

<style scoped>

</style>
