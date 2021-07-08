<template>
    <div class="editor-container has-background-grey-darker" :style="'height: ' + height + ';'">

        <b-loading :is-full-page="false" v-model="loading" class="load-screen"></b-loading>

        <transition name="fade">
            <AceEditor
                v-if="!loading"
                key="editor"
                :value="value"
                @input="$emit('input', $event)"
                @init="editorInit"
                :lang="lang"
                :theme="theme"
                width="100%"
                height="100%"
                ref="ace"
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
            />
        </transition>

    </div>
</template>

<script>
import UserPreferences from "../UserPreferences";

export default {
    name: "CodeEditor",
    props: {
        value: String,
        height: String,
        lang: String
    },
    data() {
        return {
            loading: true,
            userPreferences: {}
        }
    },
    computed: {
        wrapMode() {
            return this.userPreferences.get('editor.ace.wordWrap');
        },
        highlightActiveLine() {
            return this.userPreferences.get('editor.ace.highlightActiveLine');
        },
        showPrintMargin() {
            return this.userPreferences.get('editor.ace.showPrintMargin');
        },
        showInvisibles() {
            return this.userPreferences.get('editor.ace.showInvisibles');
        },
        theme() {
            return this.userPreferences.get('editor.ace.theme').replace('ace/theme/', '');
        },
        fontSize() {
            return this.userPreferences.get('editor.ace.fontSize');
        }
    },
    async mounted() {
        this.userPreferences = await UserPreferences.load();
        this.loading = false;
    },
    components: { AceEditor: require('vue2-ace-editor') },
    methods: {
        editorInit() {
            require('brace/ext/language_tools') //language extension prerequsite...
            require('brace/mode/' + this.lang);
            require('brace/theme/' + this.theme);
            require('brace/snippets/' + this.lang);

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

    .load-screen ::v-deep .loading-background {
        background-color: transparent;
    }
</style>
