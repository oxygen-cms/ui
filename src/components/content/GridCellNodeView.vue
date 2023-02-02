<template>
    <NodeViewWrapper :class="{'Cell': true, 'Cell--narrow': cellType === 'narrow', 'Cell--wide': cellType === 'wide', 'editable': editor.isEditable, 'selected': editor.isEditable && selectedOrChildSelected}">
        <b-field class="toolbar" v-if="editor.isEditable && selectedOrChildSelected">
            <p class="control">
                <b-button icon-left="grip-vertical" size="is-small" data-drag-handle></b-button>
            </p>
            <p class="control"><b-button icon-left="trash" size="is-small" @click="removeSelf" class="trash"></b-button></p>
            <p class="control"><b-button @click="toggleSize" size="is-small">Toggle size</b-button></p>
        </b-field>
        <NodeViewContent></NodeViewContent>
    </NodeViewWrapper>
</template>

<script>
import { nodeViewProps, NodeViewWrapper, NodeViewContent } from '@tiptap/vue-2'
export default {
    name: "GridCellNodeView",
    components: { NodeViewWrapper, NodeViewContent },
    props: nodeViewProps,
    computed: {
        cellType() {
            return this.node.attrs.cellType ?? 'narrow';
        },
        selectedOrChildSelected() {
            if(this.selected) {return true;}
            let anchor = this.editor.state.selection.$anchor;
            for(let i = anchor.depth; i >= 0; i--) {
                // console.log(JSON.stringify(this.node), JSON.stringify(anchor.node(i).toJSON()), this.node.eq(anchor.node(i)));
                if(this.node.eq(anchor.node(i))) {
                    return true;
                }
            }
            return false;
        }
    },
    data() {
        return {
        }
    },
    methods: {
        removeSelf() {
            this.deleteNode();
        },
        toggleSize() {
            this.updateAttributes({
                cellType: this.node.attrs.cellType === 'narrow' ? 'wide' : 'narrow'
            });
        }
    }
}
</script>

<style scoped>
.Cell {
    padding: 1rem;
    margin: 1rem;
    position: relative;
}

.Cell.editable {
    outline: 1px dashed blue;
    min-height: 4rem;
}
.Cell.selected {
    outline: 2px solid blue;
}

.Cell .toolbar {
    z-index: 8;
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
}

.Cell--wide {
    flex: 2;
}

.Cell--narrow {
    flex: 1;
}
</style>