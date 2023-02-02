<template>
    <div class="editor" ref="container">
        <editor-content class="content" :editor="editor" />
<!--        <b-button v-if="expanded" @click="getJSON">Get JSON</b-button>-->
<!--        <b-button v-if="expanded" @click="getHTML">Get HTML</b-button>-->
        <CommandsList :visible="commandsListVisible" ref="commandsList" :items="commandsListItems" :command="commandsListCommand" :top="commandsListTop - boundingClientRect().top" :left="commandsListLeft - boundingClientRect().left" />
        <MarkMenu :editor="editor" v-if="editor" />
        <floating-menu :editor="editor" v-if="editor && isEditable" v-show="!commandsListVisible" :should-show="shouldShowFloatingMenu" :tippy-options="{ popperOptions: { strategy: 'fixed', placement: 'left' }, getReferenceClientRect: getFloatingMenuClientRect }" class="floating-menu-contents">
                <b-dropdown @active-change="insertBlockMenuActiveChange" scrollable ref="insertBlockDropdown">
                    <template #trigger>
                        <b-button icon-left="plus" class="floating-menu-button first-child"></b-button>
                    </template>
                    <b-input type="search" v-model="commandSearchQuery" placeholder="Choose block to insert" ref="insertBlockSearch"></b-input>
                    <b-dropdown-item v-for="(item, index) in filteredNewBlocks" :key="index" @click="insertBlock(item)">
                        <b-icon :icon="item.icon"></b-icon>
                        {{ item.title }}
                    </b-dropdown-item>
                    <b-dropdown-item v-if="filteredNewBlocks.length === 0">
                        No blocks found.
                    </b-dropdown-item>
                </b-dropdown>
                <b-button icon-left="trash" @click="deleteBlock" class="floating-menu-button"></b-button>
                <b-dropdown @active-change="convertBlockMenuActiveChange" scrollable ref="convertBlockDropdown">
                    <template #trigger>
                        <b-button :icon-left="currentActiveIcon" class="floating-menu-button last-child"></b-button>
                    </template>
                    <b-dropdown-item :paddingless="true">
                        <b-input type="search" v-model="commandSearchQuery" placeholder="Change current block" ref="convertBlockSearch"></b-input>
                    </b-dropdown-item>
                    <b-dropdown-item v-for="(item, index) in filteredConvertibleBlocks" :key="index" @click="convertBlock(item)">
                        <b-icon :icon="item.icon"></b-icon>
                        {{ item.title }}
                    </b-dropdown-item>
                    <b-dropdown-item v-if="filteredConvertibleBlocks.length === 0">
                        No blocks found.
                    </b-dropdown-item>
                </b-dropdown>
        </floating-menu>
    </div>
</template>

<script>
import {Editor, EditorContent, FloatingMenu, Mark} from '@tiptap/vue-2'
import { VueNodeViewRenderer } from '@tiptap/vue-2'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import StarterKit from '@tiptap/starter-kit'
import { Node, mergeAttributes, posToDOMRect } from '@tiptap/core'
import MediaNodeView from "./MediaNodeView.vue";
import MediaInsertModal from "../media/MediaInsertModal.vue";
import HtmlNodeView from "./HtmlNodeView.vue";
import GridRowNodeView from "./GridRowNodeView.vue";
import Commands from './commands'
import GridCellNodeView from "./GridCellNodeView.vue";
import ObjectLinkNodeView from "./ObjectLinkNodeView.vue";
import CommandsList from "./CommandsList.vue";
import {debounce} from "lodash";
import {items} from "./suggestion";
import MarkMenu from "./MarkMenu.vue";

export default {
    name: "ContentEditor",
    components: {MediaInsertModal, EditorContent, CommandsList, FloatingMenu, MarkMenu },
    props: {
        content: {
            required: true
        },
        expanded: {
            type: Boolean,
            default: false
        },
        editable: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            editor: null,
            commandsListTop: 0,
            commandsListLeft: 0,
            commandsListVisible: false,
            commandsListItems: [],
            commandsListCommand: () => {},
            commandSearchQuery: '',
            currentActiveIcon: 'pencil-alt'
        }
    },
    watch: {
        'editable': 'updateEditable',
        'content': 'setContent'
    },
    computed: {
        isEditable() {
            return this.editor ? this.editor.isEditable : false;
        },
        filteredConvertibleBlocks() {
            return items({ query: this.commandSearchQuery, canConvert: true });
        },
        filteredNewBlocks() {
            return items({ query: this.commandSearchQuery });
        }
    },
    async mounted() {
        const PartialNodeView = (await import("./PartialNodeView.vue")).default;

        let extensions = [StarterKit,
            Underline,
            Link.configure({openOnClick: false}),
            Commands.configure({editorComponent: this })];

        const MediaItemNode = Node.create({
            name: 'mediaItem',
            group: 'block',
            atom: true,
            selectable: true,
            draggable: true,
            addAttributes() {
                return {
                    id: {
                        default: null,
                    },
                }
            },
            parseHTML() {
                return [
                    {
                        tag: 'media-item',
                    },
                ]
            },
            renderHTML({ HTMLAttributes }) {
                return ['media-item', mergeAttributes(HTMLAttributes)]
            },
            addNodeView() {
                return VueNodeViewRenderer(MediaNodeView)
            },
        });

        const RawHtmlNode = Node.create({
            name: 'rawHtml',
            group: 'block',
            atom: true,
            draggable: true,
            selectable: true,
            addAttributes() {
                return {
                    code: {
                        default: '',
                    },
                }
            },
            parseHTML() {
                return [
                    {
                        tag: 'raw-html',
                    },
                ]
            },
            renderHTML({ HTMLAttributes }) {
                return ['raw-html', mergeAttributes(HTMLAttributes)]
            },
            addNodeView() {
                return VueNodeViewRenderer(HtmlNodeView)
            },
        });

        const RowNode = Node.create({
            name: 'gridRow',
            group: 'block',
            isolating: true,
            selectable: true,
            draggable: true,
            content: 'gridCell*',
            parseHTML() {
                return [
                    {
                        tag: 'div',
                        getAttrs: element => element.classList.contains('Row') && null
                    },
                ]
            },
            renderHTML({ HTMLAttributes }) {
                return ['div', mergeAttributes(HTMLAttributes, {class: 'Row'}), 0]
            },
            addNodeView() {
                return VueNodeViewRenderer(GridRowNodeView)
            },
        });

        const CellNode = Node.create({
            name: 'gridCell',
            group: 'block',
            isolating: true,
            selectable: true,
            draggable: true,
            content: 'block*',
            addAttributes() {
                return {
                    cellType: {
                        default: 'wide',
                        renderHTML: (attributes) => {
                            return { 'class': attributes.cellType === 'wide' ? 'Cell Cell--wide' : 'Cell Cell--narrow' };
                        },
                        parseHTML: (element) => element.classList.contains('Cell--wide') ? 'wide' : 'narrow'
                    }
                }
            },
            parseHTML() {
                return [
                    {
                        tag: 'div',
                        getAttrs: element => element.classList.contains('Cell') && null
                    },
                ]
            },
            renderHTML({ HTMLAttributes }) {
                return ['div', mergeAttributes(HTMLAttributes), 0]
            },
            addNodeView() {
                return VueNodeViewRenderer(GridCellNodeView)
            },
        });

        const PartialNode = Node.create({
            name: 'partial',
            group: 'block',
            atom: true,
            isolating: true,
            // draggable: true,
            selectable: true,
            addAttributes() {
                return {
                    id: {
                        default: null,
                        renderHTML: (attributes) => {return {'data-partial-id': attributes.id}},
                        parseHTML: (element) => element.attrs['data-partial-id']
                    }
                }
            },
            parseHTML() {
                return [
                    {
                        tag: 'div',
                        getAttrs: element => element.hasAttribute('data-partial-id')
                    },
                ]
            },
            renderHTML({HTMLAttributes}) {
                return ['div', mergeAttributes(HTMLAttributes)];
            },
            addNodeView() {
                return VueNodeViewRenderer(PartialNodeView)
            },
        });

        const ObjectLinkNode = Node.create({
            name: 'objectLink',
            group: 'inline',
            inline: true,
            atom: true,
            isolating: true,
            selectable: true,
            addAttributes() {
                return {
                    id: {default: null},
                    type: {},
                    content: {default: null}
                }
            },
            parseHTML() {
                return [
                    {
                        tag: 'object-link'
                    },
                ]
            },
            renderHTML({HTMLAttributes}) {
                return ['object-link', mergeAttributes(HTMLAttributes)];
            },
            addNodeView() {
                return VueNodeViewRenderer(ObjectLinkNodeView)
            }
        });

        const BlockEmphasisNode = Node.create({
            name: 'blockEmphasis',
            content: 'inline+',
            defining: true,
            group: 'block',
            parseHTML() {
                return [
                    {
                        tag: 'div',
                        getAttrs: element => element.classList.contains('BlockEmphasis')
                    },
                ]
            },
            renderHTML({HTMLAttributes}) {
                return ['div', mergeAttributes(HTMLAttributes, {'class': 'BlockEmphasis'}), 0];
            },
        });

        const SmallMark = Mark.create({
            name: 'small',
            parseHTML() {
                return [
                    {
                        tag: 'small',
                        getAttrs: element => element.classList.contains('BlockEmphasis')
                    },
                ]
            },
            renderHTML({ HTMLAttributes }) {
                return ['small', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
            },
        });

        extensions.push(MediaItemNode);
        extensions.push(RawHtmlNode);
        extensions.push(RowNode);
        extensions.push(CellNode);
        extensions.push(PartialNode);
        extensions.push(ObjectLinkNode);
        extensions.push(BlockEmphasisNode);
        extensions.push(SmallMark);

        console.log('instantiating editor with content', JSON.stringify(this.content));
        this.editor = new Editor({
            content: this.content,
            editable: this.editable,
            onUpdate: this.onUpdate.bind(this),
            onSelectionUpdate: this.onSelectionUpdate.bind(this),
            extensions: extensions
        });
        this.editor.state.doc.check();
    },
    beforeDestroy() {
        if(this.editor) {
            this.editor.destroy()
        }
    },
    methods: {
        onUpdate() {
            this.onUpdateDebounced();
            this.onSelectionUpdate();
        },
        onUpdateDebounced: debounce(function() {
            this.$emit('update:content', this.editor.getJSON());
        }, 1500, {leading:true}),
        onSelectionUpdate() {
            if(this.editor.isActive('bulletList'))
            {
                this.currentActiveIcon = 'list-ul';
            } else if(this.editor.isActive('orderedList'))
            {
                this.currentActiveIcon = 'list-ol';
            } else if(this.editor.isActive('heading'))
            {
                this.currentActiveIcon = 'heading';
            }
            else if(this.editor.isActive('blockquote')) {
                this.currentActiveIcon = 'quote-left';
            } else if(this.editor.isActive('horizontalRule'))
            {
                this.currentActiveIcon = 'ruler-horizontal';
            }
            else if(this.editor.isActive('paragraph')) {
                this.currentActiveIcon = 'paragraph';
            }
        },
        getJSON() {
            console.log(JSON.stringify(this.editor.getJSON()));
        },
        getHTML() {
            console.log(this.editor.getHTML());
        },
        boundingClientRect() {
            if(!this.$refs.container) {
                return { top: 0, left: 0 };
            }
            return this.$refs.container.getBoundingClientRect();
        },
        setContent(content) {
            if(this.editor === null || JSON.stringify(this.editor.getJSON()) === JSON.stringify(content)) { return; }
            console.log("overriding editor content with ", JSON.stringify(content));
            this.editor.commands.setContent(content);
        },
        updateEditable(newEditable) {
            console.log('updating editable state', newEditable);
            this.editor.setEditable(newEditable);
        },
        shouldShowFloatingMenu({editor, view, state, oldState}) {
            return editor.isActive('paragraph') || editor.isActive('bulletList') || editor.isActive('blockquote') || editor.isActive('heading') || editor.isActive('orderedList') || editor.isActive('horizontalRule');
        },
        getFloatingMenuClientRect() {
            let from = this.editor.view.state.selection.from;
            let to = this.editor.view.state.selection.to;
            let domRect = posToDOMRect(this.editor.view, from, to);
            const offset = 130;
            domRect.left = this.$refs.container.getBoundingClientRect().left - offset;
            domRect.right = domRect.left;
            domRect.width = 0;
            return { ... domRect };
        },
        convertBlockMenuActiveChange(active) {
            if(active) {
                this.commandSearchQuery = '';
                this.$refs.convertBlockSearch.focus();
            }
        },
        insertBlockMenuActiveChange(active) {
            if(active) {
                this.commandSearchQuery = '';
                this.$refs.insertBlockSearch.focus();
            }
        },
        convertBlock(item) {
            let command = this.editor.chain().focus();
            command = item.command({ editor: this.editor, range: null, command: command });
            command.run();
        },
        insertBlock(item) {
            let resolvedPos = this.editor.state.doc.resolve(this.editor.state.selection.to);
            let afterCurrentNode = resolvedPos.posAtIndex(0, 1) + resolvedPos.node(1).nodeSize - 1;
            let tr = this.editor.state.tr.insert(afterCurrentNode, item.node({editor: this.editor}));
            this.editor.view.dispatch(tr);
            this.editor.chain().focus().setTextSelection(afterCurrentNode + 1).run();
        },
        deleteBlock() {
            let resolvedPos = this.editor.state.doc.resolve(this.editor.state.selection.to);
            let currentNode = resolvedPos.posAtIndex(0, 1);
            let afterCurrentNode = currentNode + resolvedPos.node(1).nodeSize;
            let tr = this.editor.state.tr.delete(currentNode - 1, afterCurrentNode - 1);
            this.editor.view.dispatch(tr);
            this.editor.chain().focus().run();
        }
    }
}
</script>

<style scoped>
.editor {
    /* prevent margin collapsing from editor contents */
    overflow: visible;

    position: relative;
    background-color: #fff;
}

.content {
    margin-bottom: 0;
}

.floating-menu-button:not(.first-child) {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
}

.floating-menu-button:not(.last-child) {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
}

.floating-menu-button:not(.first-child.last-child) {
    margin-left: -1px;
    margin-right: -1px;
}
</style>

<style>
.ProseMirror-focused {
    outline: none;
}
</style>