<template>
    <div class="editor" ref="container">
        <editor-content class="content" :editor="editor" />
        <b-button v-if="expanded" @click="getJSON">Get JSON</b-button>
        <CommandsList :visible="commandsListVisible" ref="commandsList" :items="commandsListItems" :command="commandsListCommand" :top="commandsListTop - boundingClientRect().top" :left="commandsListLeft - boundingClientRect().left" />
        <bubble-menu :editor="editor" v-if="editor" :should-show="shouldShowMarksMenu" ref="bubbleMenu">
            <div class="bubble-menu">
            <p class="control"><b-button size="is-small" :type="editor.isActive('bold') ? 'is-info' : 'is-light'" icon-left="bold" @click="toggleMark('bold')"></b-button></p>
            <p class="control"><b-button size="is-small" :type="editor.isActive('italic') ? 'is-info' : 'is-light'" icon-left="italic" @click="toggleMark('italic')"></b-button></p>
            <p class="control"><b-button size="is-small" :type="editor.isActive('underline') ? 'is-info' : 'is-light'" icon-left="underline" @click="toggleMark('underline')"></b-button></p>
            <p class="control"><b-button size="is-small" :type="editor.isActive('strike') ? 'is-info' : 'is-light'" icon-left="strikethrough" @click="toggleMark('strike')"></b-button></p>
            <p class="control"><b-button size="is-small" :type="linkPanelActive ? 'is-info' : 'is-light'" icon-left="link" @click="toggleMark('link')"></b-button>
            </p>
            <p class="control"><b-button size="is-small" type="is-light" icon-left="remove-format" @click="editor.chain().focus().unsetAllMarks().run()"></b-button></p>
            </div>
            <div v-show="linkPanelActive" type="is-light">
                <div class="modal-card" style="z-index: 10000;">
                    <header class="modal-card-head">
                        <p class="modal-card-title">Edit Link</p>
                        <b-button icon-left="external-link-alt" @click="openLink">Open link</b-button>
                    </header>
                    <div class="modal-card-body">
                        <b-field label="URL" label-position="on-border">
                            <b-input :value="linkUrl" @input="v => onLinkUpdate({linkUrl: v, linkOpenInNewWindow: linkOpenInNewWindow})"></b-input>
                        </b-field>
                        <b-switch :value="linkOpenInNewWindow" @input="v => onLinkUpdate({linkOpenInNewWindow: v, linkUrl: linkUrl})">Open in new window</b-switch>
                        <br>
                    </div>
                </div>
            </div>
        </bubble-menu>
        <floating-menu :editor="editor" v-if="editor && isEditable" v-show="!commandsListVisible" :should-show="shouldShowFloatingMenu" :tippy-options="{ popperOptions: { strategy: 'fixed', placement: 'left' }, getReferenceClientRect: getFloatingMenuClientRect }">
            <b-dropdown @active-change="insertBlockMenuActiveChange" scrollable ref="insertBlockDropdown">
                <template #trigger>
                    <b-button type="is-light" icon-left="plus"></b-button>
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
            <b-button type="is-light" icon-left="trash" class="ml-2 mr-2" @click="deleteBlock"></b-button>
            <b-dropdown @active-change="convertBlockMenuActiveChange" scrollable ref="convertBlockDropdown">
                <template #trigger>
                    <b-button type="is-light" :icon-left="currentActiveIcon"></b-button>
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
import {Editor, EditorContent, FloatingMenu, BubbleMenu, isTextSelection} from '@tiptap/vue-2'
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
import CommandsList from "./CommandsList.vue";
import {debounce} from "lodash";
import {items} from "./suggestion";

export default {
    name: "ContentEditor",
    components: {MediaInsertModal, EditorContent, CommandsList, FloatingMenu, BubbleMenu },
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
            currentActiveIcon: 'pencil-alt',
            linkPanelActive: false,
            linkUrl: '',
            linkOpenInNewWindow: false
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
            content: 'gridCell*',
            parseHTML() {
                return [
                    {
                        tag: 'grid-row',
                    },
                ]
            },
            renderHTML({ HTMLAttributes }) {
                return ['grid-row', mergeAttributes(HTMLAttributes)]
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
                        default: 'wide'
                    }
                }
            },
            parseHTML() {
                return [
                    {
                        tag: 'grid-cell',
                    },
                ]
            },
            renderHTML({ HTMLAttributes }) {
                return ['grid-cell', mergeAttributes(HTMLAttributes)]
            },
            addNodeView() {
                return VueNodeViewRenderer(GridCellNodeView)
            },
        });

        const PartialNode = Node.create({
            name: 'partial',
            group: 'block',
            atom: true,
            draggable: false,
            selectable: true,
            isolating: true,
            addAttributes() {
                return {
                    id: {
                        default: null
                    }
                }
            },
            parseHTML() {
                return [
                    {
                        tag: 'partial-node',
                    },
                ]
            },
            renderHTML({ HTMLAttributes }) {
                return ['partial-node', mergeAttributes(HTMLAttributes)]
            },
            addNodeView() {
                return VueNodeViewRenderer(PartialNodeView)
            },
        });

        this.editor = new Editor({
            content: this.content,
            editable: this.editable,
            onUpdate: this.onUpdate.bind(this),
            onSelectionUpdate: this.onSelectionUpdate.bind(this),
            extensions: [
                StarterKit,
                MediaItemNode,
                RawHtmlNode,
                RowNode,
                CellNode,
                PartialNode,
                Underline,
                Link.configure({openOnClick: false}),
                Commands.configure({editorComponent: this })
            ],
        })
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
        }, 2000, {leading:true}),
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
        boundingClientRect() {
            if(!this.$refs.container) {
                return { top: 0, left: 0 };
            }
            return this.$refs.container.getBoundingClientRect();
        },
        setContent(content) {
            if(JSON.stringify(this.editor.getJSON()) === JSON.stringify(content)) { return; }
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
        shouldShowMarksMenu({view, state, from, to}) {
            const { doc, selection } = state
            const { empty } = selection

            // Sometime check for `empty` is not enough.
            // Doubleclick an empty paragraph returns a node size of 2.
            // So we check also for an empty text size.
            const isEmptyTextBlock = !doc.textBetween(from, to).length
                && isTextSelection(state.selection)

            // When clicking on an element inside the bubble menu the editor "blur" event
            // is called and the bubble menu item is focussed. In this case we should
            // consider the menu as part of the editor and keep showing the menu
            const isChildOfMenu = this.$refs.bubbleMenu.$el.contains(document.activeElement)

            const hasEditorFocus = view.hasFocus() || isChildOfMenu

            const isMarkActive = this.editor.isActive('link') || this.editor.isActive('bold') || this.editor.isActive('italic') || this.editor.isActive('underline') || this.editor.isActive('strike');

            if(this.editor.isActive('link'))
            {
                let attrs = this.editor.getAttributes('link');
                console.log('getLink', attrs);
                this.linkUrl = attrs.href;
                this.linkOpenInNewWindow = attrs.target === '_blank';
                this.linkPanelActive = true;
            } else {
                this.linkPanelActive = false;
            }

            return hasEditorFocus && ((!empty && !isEmptyTextBlock) || isMarkActive) && this.editor.isEditable;
        },
        getFloatingMenuClientRect() {
            let from = this.editor.view.state.selection.from;
            let to = this.editor.view.state.selection.to;
            let domRect = posToDOMRect(this.editor.view, from, to);
            const offset = 154;
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
            console.log(afterCurrentNode);
            let tr = this.editor.state.tr.insert(afterCurrentNode, item.node({editor: this.editor}));
            this.editor.view.dispatch(tr);
            this.editor.chain().focus().setTextSelection(afterCurrentNode + 1).run();
        },
        deleteBlock() {
            let resolvedPos = this.editor.state.doc.resolve(this.editor.state.selection.to);
            let currentNode = resolvedPos.posAtIndex(0, 1);
            let afterCurrentNode = currentNode + resolvedPos.node(1).nodeSize;
            console.log(currentNode, afterCurrentNode);
            let tr = this.editor.state.tr.delete(currentNode - 1, afterCurrentNode - 1);
            this.editor.view.dispatch(tr);
            this.editor.chain().focus().run();
        },
        openLink() {
            window.open(this.linkUrl, '_blank').focus();
        },
        onLinkUpdate: debounce(function ({ linkUrl, linkOpenInNewWindow }) {
            this.linkUrl = linkUrl;
            this.linkOpenInNewWindow = linkOpenInNewWindow;
            let props = { href: linkUrl };
            if(linkOpenInNewWindow) {
                props.target = '_blank';
            }
            console.log('setLink', props);
            let oldSelection = this.editor.state.selection.getBookmark();
            this.editor.chain().extendMarkRange('link').setLink(props).run();
            this.editor.view.dispatch(this.editor.state.tr.setSelection(oldSelection.resolve(this.editor.state.doc)));
        }, 1000),
        toggleMark(ty) {
            let oldSelection = this.editor.state.selection.getBookmark();
            let cmd = this.editor.chain().focus()
            if(this.editor.isActive(ty))
            {
                cmd = cmd.extendMarkRange(ty);
            }
            let uppercaseTy = ty.charAt(0).toUpperCase() + ty.slice(1);;
            let toggle = cmd['toggle' + uppercaseTy];
            toggle().run();
            this.editor.view.dispatch(this.editor.state.tr.setSelection(oldSelection.resolve(this.editor.state.doc)));
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
    height: 100%;
}

.bubble-menu {
    display: flex;
}

.b-tooltip.is-light ::v-deep .tooltip-content {
    background: none;
    box-shadow: none;
    padding: 0;
}
</style>

<style>
.ProseMirror-focused {
    outline: none;
}
</style>