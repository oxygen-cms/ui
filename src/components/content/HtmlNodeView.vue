<template>
    <NodeViewWrapper>
        <div :class="{wrapper: true, editable: isEditable, selected: isEditable && selected}">
            <template v-if="editing && isEditable">
                <CodeEditor lang="html" height="20em" :value="node.attrs.code" @input="onInput"></CodeEditor>
                <b-field class="toolbar">
                    <p class="control"><b-button size="is-small" icon-left="save" @click="save"></b-button></p>
                    <p class="control"><b-button size="is-small" icon-left="trash" @click="removeSelf"></b-button></p>
                </b-field>
            </template>
            <template v-else>
                <b-field v-if="isEditable" class="toolbar">
                    <p class="control"><b-button size="is-small" data-drag-handle icon-left="grip-vertical"></b-button></p>
                    <p class="control"><b-button size="is-small" icon-left="pencil-alt" @click="editing = true"></b-button></p>
                    <p class="control"><b-button size="is-small" icon-left="trash" @click="removeSelf"></b-button></p>
                </b-field>
                <div v-html="node.attrs.code"></div>
            </template>
        </div>
    </NodeViewWrapper>
</template>

<script>
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-2'
import CodeEditor from "../CodeEditor.vue";
export default {
    name: "HtmlNodeView",
    components: {CodeEditor, NodeViewWrapper},
    props: nodeViewProps,
    data() {
        return {
            editing: false,
            latestValue: null
        }
    },
    computed: {
        isEditable() {
            return this.editor && this.editor.isEditable;
        }
    },
    watch: {
        'node': 'syncLatestValue'
    },
    mounted() {
        if(!this.node.attrs.code) {
            this.editing = true;
        }
        this.syncLatestValue();
    },
    methods: {
        onInput(value) {
            this.latestValue = value;
        },
        save() {
            console.log("save", this.latestValue);
            this.updateAttributes({
                code: this.latestValue
            });
            this.editing = false;
        },
        syncLatestValue() {
            this.latestValue = this.node.attrs.code;
        },
        removeSelf() {
            this.deleteNode();
        }
    }
}
</script>

<style scoped>
    .wrapper {
        position: relative;
    }
    .wrapper.editable {
        min-height: 4rem;
        outline: 1px dashed green;
    }
    .wrapper.selected {
        outline: 2px solid green;
    }

    .toolbar {
        z-index: 9;
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
    }
</style>