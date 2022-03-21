<template>
    <div class="editor-container has-background-grey-darker" :style="'height: ' + height + ';'">
        <transition name="fade">
            <AceEditor
                key="editor"
                ref="ace"
                :value="value"
                :lang="lang"
                :theme="theme"
                width="100%"
                height="100%"
                :options="{
                    enableBasicAutocompletion: true,
                    enableLiveAutocompletion: true,
                    fontSize: fontSize,
                    highlightActiveLine: highlightActiveLine,
                    enableSnippets: true,
                    showLineNumbers: true,
                    wrap: wrapMode,
                    tabSize: 4,
                    showPrintMargin: showPrintMargin,
                    showInvisibles: showInvisibles,
                    showGutter: true,
            }"
                @input="$emit('input', $event)"
                @init="editorInit"
            />
        </transition>
    </div>
</template>

<script>

import AceEditor from 'vue2-ace-editor';
import 'brace/ext/language_tools'; //language extension prerequsite...
import 'brace/mode/html';
import 'brace/mode/twig';
import 'brace/theme/tomorrow_night_eighties';
import 'brace/theme/tomorrow_night';

export default {
    name: "CodeEditor",
    components: { AceEditor },
    props: {
        value: { type: String, default: null },
        height: { type: String, required: true },
        lang: { type: String, required:  true }
    },
    data() {
        return {
        }
    },
    computed: {
        wrapMode() {
            return this.$store.getters.userPreferences.get('editor.ace.wordWrap');
        },
        highlightActiveLine() {
            return this.$store.getters.userPreferences.get('editor.ace.highlightActiveLine');
        },
        showPrintMargin() {
            return this.$store.getters.userPreferences.get('editor.ace.showPrintMargin');
        },
        showInvisibles() {
            return this.$store.getters.userPreferences.get('editor.ace.showInvisibles');
        },
        theme() {
            return this.$store.getters.userPreferences.get('editor.ace.theme').replace('ace/theme/', '');
        },
        fontSize() {
            return this.$store.getters.userPreferences.get('editor.ace.fontSize');
        }
    },
    methods: {
        editorInit() {
            // ignore first missing DOCTYPE warning
            let session = this.$refs.ace.editor.getSession();
            session.on("changeAnnotation", () => {
                const a = session.getAnnotations();
                const b = a.slice(0).filter( (item) => item.text.indexOf('DOC') === -1 );
                if(a.length > b.length) session.setAnnotations(b);
            });
        }
    }
}
</script>

<style scoped>
    .editor-container {
        width: 100%;
        position: relative;
    }
</style>
