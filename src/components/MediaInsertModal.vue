<template>
    <b-modal :active.sync="active" trap-focus has-modal-card aria-role="dialog" aria-modal auto-focus width="80%" class="media-insert-modal">
        <div class="modal-card">
            <header class="modal-card-head">
                <slot name="title"><p class="modal-card-title">Choose an item to insert</p></slot>
            </header>
            <section class="modal-card-body">
                <MediaList @navigate="onNavigate" @double-click-action="doInsert" @select-files="items => selectedFiles = items" :current-path="currentPath" :in-trash="inTrash" :search-query="searchQuery" />
            </section>
            <footer class="modal-card-foot is-flex">
                <div class="is-flex-grow-1"></div>
                <b-button @click="emitClose">Close</b-button>
                <b-button @click="doInsert" :disabled="selectedFiles.length === 0 || (!multiselectAllowed && selectedFiles.length > 1)" type="is-primary">
                    <span v-if="selectedFiles.length === 0">{{ actionVerb }}</span>
                    <span v-else-if="selectedFiles.length === 1">{{actionVerb }} item</span>
                    <span v-else-if="multiselectAllowed">{{ actionVerb }} {{ selectedFiles }} items</span>
                    <span v-else>Select only a single item</span>
                </b-button>
            </footer>
        </div>
    </b-modal>
</template>

<script>
import MediaList from './MediaList.vue';

export default {
    name: "MediaInsertModal",
    components: { MediaList },
    props: {
        active: Boolean,
        multiselectAllowed: {
            type: Boolean,
            default: true
        },
        actionVerb: {
            type: String,
            default: 'Insert'
        }
    },
    data() {
        return {
            currentPath: '',
            inTrash: false,
            searchQuery: null,
            selectedFiles: []
        }
    },
    watch: {
        active: function(active) {
            this.$emit('update:active', active);
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

    .media-insert-modal ::v-deep .animation-content {
        width: 80%;
        height: 80%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>
