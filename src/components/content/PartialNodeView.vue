<template>
    <NodeViewWrapper class="wrapper" :class="{editable: isEditable, selected: isEditable && selectedOrEditorFocused}">
        <div v-if="isEditable" class="toolbar">
            <div class="my-field has-addons" style="width: 100%">
                <p v-if="!partial" class="control">
                    <b-button size="is-small" @click="partialChooserActive = true">Choose an existing partial</b-button>
                </p>
                <p v-if="!partial" class="control">
                    <b-button size="is-small" @click="createPartialModalActive = true">Create from scratch</b-button>
                </p>
                <div class="is-flex-grow-1"></div>
                <p v-if="partial" class="control">
                    <b-button size="is-small" type="is-dark" @click="partialChooserActive = true">{{ partial.key }}</b-button>
                </p>
<!--                <p class="control">-->
<!--                    <b-button size="is-small" data-drag-handle type="is-dark" icon-left="grip-vertical"></b-button>-->
<!--                </p>-->
                <p v-if="partial" class="control">
                    <b-button size="is-small" :disabled="!saveButtonEnabled" icon-left="save" type="is-dark" @click="savePartial"></b-button>
                </p>
                <p v-if="partial" class="control">
                    <b-dropdown position="is-bottom-left">
                        <template #trigger>
                            <b-button icon-left="sliders-h" size="is-small" type="is-dark"></b-button>
                        </template>
                        <div class="modal-card">
                            <header class="modal-card-head">
                                <p class="modal-card-title">Edit Partial Settings</p>
                            </header>
                            <div v-if="partial" class="modal-card-body">
<!--                                <h2></h2>-->
                                <b-field label="Title" label-position="on-border">
                                    <b-input :value="partial.title" @input="v => partial.title = v"></b-input>
                                </b-field>
                                <br>
                                <b-field label="Slug" label-position="on-border">
                                    <b-input :value="partial.key" @input="v => partial.key = v"></b-input>
                                </b-field>
                            </div>
                        </div>
                    </b-dropdown>
                </p>
                <p class="control"><b-button icon-left="trash" size="is-small" type="is-danger" @click="removeSelf"></b-button></p>
            </div>
        </div>
        <b-modal :active="partialChooserActive" has-modal-card aria-role="dialog" aria-modal auto-focus @update:active="(v) => partialChooserActive = v">
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">Choose a partial to use</p>
                </header>
                <section class="modal-card-body">
                    <PartialList :in-trash="false" search-query="" @choose="selectPartial" />
                </section>
                <footer class="modal-card-foot"></footer>
            </div>
        </b-modal>
        <b-modal :active="createPartialModalActive" has-modal-card aria-role="dialog" aria-modal auto-focus @update:active="(v) => createPartialModalActive = v">
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">Partial</p>
                </header>
                <section class="modal-card-body">
                    <p>A partial represents a fragment of reusable content which can be included in multiple places and/or on multiple pages.</p>
                    <hr>
                    <b-field label="Title" label-position="on-border">
                        <b-input v-model="title" />
                    </b-field>
                    <br>
                    <b-field label="Slug" label-position="on-border">
                        <b-input v-model="slug" />
                    </b-field>
                </section>
                <footer class="modal-card-foot is-flex">
                    <div class="is-flex-grow-1"></div>
                    <b-button @click="createPartialModalActive = false">Close</b-button>
                    <b-button type="is-success" @click="createPartial">
                        Create Partial
                    </b-button>
                </footer>
            </div>
        </b-modal>
        <ContentEditor v-if="partial !== null" ref="editor" :editable="isEditable" :content="partial.richContent" class="editor-content" @update:content="updateContent" />
        <em v-else-if="!isEditable">Unlinked partial block...</em>
    </NodeViewWrapper>
</template>

<script>
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-2'
import ContentEditor from "./ContentEditor.vue";
import PartialsApi from "../../PartialsApi.js";
import PartialList from "../PartialList.vue";

export default {
    name: "PartialNodeView",
    components: {ContentEditor, NodeViewWrapper, PartialList },
    props: nodeViewProps,
    data() {
        return {
            partialsApi: new PartialsApi(),
            partialChooserActive: false,
            createPartialModalActive: false,
            partial: null,
            serverPartial: null,
            slug: 'layout.nav',
            title: 'Navigation',
        }
    },
    computed: {
        isEditable() {
            return this.editor.isEditable;
        },
        saveButtonEnabled() {
            return this.partial && (JSON.stringify(this.partial) !== JSON.stringify(this.serverPartial));
        },
        selectedOrEditorFocused() {
            return this.selected || (this.$refs.editor && this.$refs.editor.editor.isFocused);
        }
    },
    watch: {
        'node': 'loadPartial'
    },
    mounted() {
        this.loadPartial()
    },
    methods: {
        async loadPartial() {
            if(this.node.attrs.id === null) {
                return;
            }
            let response = await this.partialsApi.get(this.node.attrs.id);
            this.selectPartial(response.item);
        },
        removeSelf() {
            this.deleteNode();
        },
        async createPartial() {
            let response = await this.partialsApi.create({
                key: this.slug,
                title: this.title
            });
            if(!response.item) {
                return;
            }
            this.createPartialModalActive = false;
            this.selectPartial(response.item);
        },
        selectPartial(partial) {
            console.log('select partial', partial);
            this.partial = { ...partial };
            this.serverPartial = { ... partial };
            this.partialChooserActive = false;
            this.updateAttributes({ id: this.partial.id });
            // let rect = this.$el.getBoundingClientRect();
            // console.log(rect);
            // this.absTop = rect.top;
            // this.absLeft = rect.left;
            // this.absWidth = rect.width;
        },
        updateContent(newContent) {
            this.partial.richContent = newContent;
        },
        async savePartial() {
            // force update the content
            this.$refs.editor.onUpdate();

            let res = await this.partialsApi.update(this.partial);
            this.partial = { ... res.item };
            this.serverPartial = { ... res.item };
        }
    }
}
</script>

<style scoped>
.wrapper {
    position: relative;
    background-color: #555;
}
.wrapper.editable {
    outline: 2px dashed purple;
    padding-top: 30px;
}
.wrapper.selected {
    outline-style: solid;
}

::v-deep(.editor > .editor-content > .ProseMirror) {
    min-height: 4rem;
}

.toolbar {
    display: flex;
    z-index: 11;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
}

.editor-content {
    position: relative;
}

p.control {
    margin-bottom: 0;
}

.my-field {
    display: flex;
}
</style>

<style>
.my-field > .control > .button {
    border-radius: 0;
}
</style>