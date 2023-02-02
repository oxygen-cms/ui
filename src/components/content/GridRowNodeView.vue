<template>
    <NodeViewWrapper class="wrapper" :class="{editable: editor.isEditable}">
        <b-field class="toolbar" v-if="editor.isEditable">
            <p class="control"><b-button icon-left="trash" size="is-small" @click="removeSelf"></b-button></p>
            <p class="control"><b-button icon-left="plus" size="is-small" @click="addCell"></b-button></p>
        </b-field>
        <NodeViewContent class="Row"></NodeViewContent>
    </NodeViewWrapper>
</template>

<script>
import { nodeViewProps, NodeViewWrapper, NodeViewContent } from '@tiptap/vue-2'
export default {
    name: "GridRowNodeView",
    components: { NodeViewWrapper, NodeViewContent },
    props: nodeViewProps,
    data() {
        return {
        }
    },
    methods: {
        removeSelf() {
            this.deleteNode();
        },
        addCell() {
            this.editor.commands.insertContentAt(this.getPos() + 1, {
                type: 'gridCell'
            })
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
    outline: 2px dashed red;
}

.toolbar {
    z-index: 8;
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
}

.Row {
    display: flex;
}
</style>