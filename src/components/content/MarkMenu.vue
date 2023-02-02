<template>
    <bubble-menu :editor="editor" :should-show="shouldShowMarksMenu" ref="bubbleMenu">
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
</template>

<script>
import {debounce} from "lodash";
import {BubbleMenu, isTextSelection} from "@tiptap/vue-2";

export default {
    name: "MarkMenu",
    props: {
        editor: {type: Object, required: true}
    },
    components: {BubbleMenu},
    data() {
        return {
            linkPanelActive: false,
            linkUrl: '',
            linkOpenInNewWindow: false
        }
    },
    methods: {
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
        },
        shouldShowMarksMenu({view, state, from, to}) {
            const { doc, selection } = state
            const { empty } = selection

            let isNodeSelection = selection.node;

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
                this.linkUrl = attrs.href;
                this.linkOpenInNewWindow = attrs.target === '_blank';
                this.linkPanelActive = true;
            } else {
                this.linkPanelActive = false;
            }

            return hasEditorFocus && ((!empty && !isEmptyTextBlock && !isNodeSelection) || isMarkActive) && this.editor.isEditable;
        },
    }
}
</script>

<style scoped>
.bubble-menu {
    display: flex;
}
</style>