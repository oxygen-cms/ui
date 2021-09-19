<template>
    <div class="content">
      <h3>Export Data</h3>
      <p>
        Create a backup of all the content and settings of the website.<br>
        It is recommended to make regular backups to ensure the safety of your content.
      </p>
      <b-button type="is-primary" size="is-medium" @click="processDownload" :loading="exporting">Download data as `.zip`</b-button>

      <h3>Import Data</h3>
      <p>To restore the contents and settings of this site from a backup, use the Artisan Console.</p>
    </div>
</template>

<script>
import {FetchBuilder} from "../api";
import {API_ROOT} from "../CrudApi";

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
            let builder = (new FetchBuilder(this.$buefy, 'post'))
                .cookies();
            await builder.setXsrfTokenHeader();
            let response = await window.fetch(API_ROOT + "import-export/export", { ... builder });
            this.$buefy.notification.open({ message: 'Export successful', type: 'is-success', queue: false });
            let blob = await response.blob();
            let file = window.URL.createObjectURL(blob);
            this.exporting = false;
            window.location.assign(file);
        }
    }
}
</script>

<style scoped>

</style>
