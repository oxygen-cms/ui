<template>
    <div class="modal-card">
        <header class="modal-card-head">
            <p class="modal-card-title">Choose an item to insert</p>
        </header>
        <section class="modal-card-body">
            <MediaList @navigate="onNavigate" :double-click-action="doInsert" @select-files="items => selectedFiles = items" :current-path="currentPath" :in-trash="inTrash" :search-query="searchQuery" />
        </section>
        <footer class="modal-card-foot is-flex">
            <div class="is-flex-grow-1"></div>
            <b-button @click="emitClose">Close</b-button>
            <b-button @click="doInsert" :disabled="selectedFiles.length === 0" type="is-primary">
                <span v-if="selectedFiles.length === 0">Insert</span>
                <span v-else-if="selectedFiles.length === 1">Insert item</span>
                <span v-else>Insert {{ selectedFiles }} items</span>
            </b-button>
        </footer>
    </div>

</template>

<script>
import MediaList from './MediaList.vue';

export default {
    name: "MediaInsertModal",
    components: { MediaList },
    data() {
        return {
            currentPath: '',
            inTrash: false,
            searchQuery: null,
            selectedFiles: []
        }
    },
    methods: {
        onNavigate(options) {
            this.currentPath = options.currentPath ? options.currentPath : '';
            this.inTrash = !!options.inTrash;
            this.searchQuery = options.searchQuery ? options.searchQuery : null;
        },
        emitClose() {
            this.$emit('close');
        },
        doInsert() {
            this.$emit('select', this.selectedFiles);
        }
    }
}
</script>

<style scoped>
    .modal-card {
        width: 100%;
        height: 100%;
        max-width: 1600px;
    }

    .modal-card-body {
        padding: 0;
    }
</style>
