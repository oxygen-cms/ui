<template>
    <b-modal :active="active" trap-focus has-modal-card aria-role="dialog" aria-modal auto-focus width="80%" class="media-insert-modal" @update:active="updateActive">
        <div class="modal-card">
            <header class="modal-card-head">
                <slot name="title"><p class="modal-card-title">Choose an item to insert</p></slot>
            </header>
            <section class="modal-card-body">
                <MediaList :current-path="currentPath" :in-trash="inTrash" :search-query="searchQuery" @navigate="onNavigate" @double-click-action="doInsert" @select-files="items => selectedFiles = items" />
            </section>
            <footer class="modal-card-foot is-flex">
                <b-field v-if="showSizeOption" class="size-option" label-position="on-border">
                    <template #label>
                        <b-tooltip position="is-right" multilined label="This controls how large the image is displayed on the page. Expressed as a percentage of the container width.">
                            Image Size
                        </b-tooltip>
                    </template>
                    <b-slider v-model="size" :min="10" :max="100" :step="10" ticks></b-slider>
                </b-field>
                <div class="is-flex-grow-1"></div>
                <b-button @click="emitClose">{{ closeVerb }}</b-button>
                <b-button :disabled="selectedFiles.length === 0 || (!multiselectAllowed && selectedFiles.length > 1)" type="is-primary" @click="doInsert">
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
        },
        showSizeOption: {
            type: Boolean,
            default: false
        },
        defaultSize: {
            type: Number,
            default: 90
        },
        closeVerb: {
            type: String,
            default: 'Close'
        }
    },
    data() {
        return {
            currentPath: '',
            inTrash: false,
            searchQuery: null,
            selectedFiles: [],
            size: this.defaultSize
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
            this.$emit('select', this.selectedFiles, this.showSizeOption ? { size: this.size } : {});
        },
        updateActive(newVal) {
            if(!newVal) {
                this.emitClose();
            }
        }
    }
}
</script>

<style scoped>
    .size-option {
        width: 300px;
        margin: 0 1.5rem 0 0.5rem;
    }

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
