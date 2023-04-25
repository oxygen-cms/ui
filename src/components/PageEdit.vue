<template>
    <div class="full-height is-flex is-flex-direction-column is-align-items-stretch">
        <div class="page-details is-flex is-flex-direction-row">
            <div class="page-title is-flex-grow-1">
                <transition name="fade" mode="out-in">
                    <b-skeleton v-if="loading" key="skeleton"></b-skeleton>
                    <span v-else key="name" class="title">Edit Page - {{ model.title }}</span>
                </transition>
            </div>
            <div class="is-flex-grow-1"></div>
            <div>
                <b-switch :value="editable" @input="v => editable = v">Editable?</b-switch>
                <b-button icon-left="cog" @click="editPageModalActive = true">Page Settings</b-button>
                <b-button type="is-primary" icon-left="save" @click="save">Save</b-button>
            </div>
        </div>
        <b-modal :active="editPageModalActive" has-modal-card trap-focus aria-modal auto-focus @update:active="v => editPageModalActive = v">
            <div class="modal-card is-relative">
                <div class="modal-card-head">
                    <p class="modal-card-title">Edit Page Settings</p>
                </div>
                <div class="modal-card-body">
                    <b-loading :active="loading" :is-full-page="false"></b-loading>
                    <div v-if="!loading">
                        <b-field label="Title">
                            <b-input v-model="model.title" placeholder="Title"></b-input>
                        </b-field>
                        <b-field>
                            <template #label>
                                URL
                                <b-tooltip multilined position="is-right" type="is-dark" label="The URL at which this page is located. It can only contain letters, numbers, slashes and dashes. Valid examples include: '/', 'my-page-123', 'some/nested/page'">
                                    <b-icon size="is-small" icon="question-circle"></b-icon>
                                </b-tooltip>
                            </template>
                            <b-input v-model="model.slug" placeholder="slug"></b-input>
                        </b-field>
                        <b-field label="Description">
                            <b-input v-model="model.description" type="textarea" placeholder="page description"></b-input>
                        </b-field>
                        <b-field>
                            <template #label>
                                Tags
                                <b-tooltip multilined position="is-right" type="is-dark" label="A list of keywords for this page. Used for SEO">
                                    <b-icon size="is-small" icon="question-circle"></b-icon>
                                </b-tooltip>
                            </template>
                            <b-taginput v-model="model.tags"></b-taginput>
                        </b-field>
<!--                        <b-collapse-->
<!--                            class="card"-->
<!--                            animation="slide"-->
<!--                            :open="false">-->
<!--                            <template #trigger="props">-->
<!--                                <div-->
<!--                                    class="card-header"-->
<!--                                    role="button"-->
<!--                                    :aria-expanded="props.open"-->
<!--                                >-->
<!--                                    <p class="card-header-title">-->
<!--                                        Advanced Options-->
<!--                                    </p>-->
<!--                                    <a class="card-header-icon">-->
<!--                                        <b-icon-->
<!--                                            :icon="props.open ? 'caret-down' : 'caret-up'">-->
<!--                                        </b-icon>-->
<!--                                    </a>-->
<!--                                </div>-->
<!--                            </template>-->
<!--                            <div class="card-content">-->
<!--                                <div class="content">-->
                        <div class="field">
                            <label class="label">
                                Metadata
                                <b-tooltip multilined label="An HTML field used to inject custom metadata into the page. Used for SEO." position="is-right" type="is-dark">
                                    <b-icon size="is-small" icon="question-circle"></b-icon>
                                </b-tooltip>
                            </label>
                            <div class="control">
                                <CodeEditor v-model="model.meta" lang="html" height="10rem" />
                            </div>
                        </div>
                        <div class="field">
                            <label class="label">Options</label>
                            <div class="control">
                                <CodeEditor v-model="model.options" lang="json" height="10rem" />
                            </div>
                        </div>
<!--                                </div>-->
<!--                            </div>-->
<!--                        </b-collapse>-->
                    </div>
                </div>
            </div>
        </b-modal>
        <div class="is-relative editor-parent">
            <b-loading :active="loading" :is-full-page="false"></b-loading>
            <ContentEditor v-if="!loading" :editable="editable" :expanded="true" :content="model.richContent" @update:content="v => model.richContent = v" />
        </div>
    </div>
</template>

<script>
import ContentEditor from "./content/ContentEditor.vue";
import PagesApi from "../PagesApi";
import CodeEditor from "./CodeEditor.vue";
import {morphToNotification} from "../api.js";
export default {
    name: "PageCreate",
    components: {ContentEditor, CodeEditor},
    data() {
        return {
            loading: true,
            model: null,
            serverModel: null,
            editable: true,
            editPageModalActive: false,
            pagesApi: new PagesApi(),
            // content: { type: 'doc', content: [{type:'paragraph',content:[{type:'text',text:'I’m running Tiptap with Vue.js. 🎉'}]}]}
        }
    },
    mounted() {
        this.fetchData()
    },
    methods: {
        async fetchData() {
            this.loading = true;
            let res = await this.pagesApi.get(this.$route.params.id);
            console.log(res);
            this.setModel(res.item);
        },
        setModel(model) {
            this.loading = false;
            this.model = model;
            this.serverModel = model;
        },
        async save() {
            // this.submittingForm = true;
            let response = await this.pagesApi.update(this.model);
            // this.submittingForm = false;
            this.setModel(response.item);
            this.$buefy.toast.open(morphToNotification(response));
        }
    }
}
</script>

<style scoped>
    @import "../components/util.css";

    .page-details {
        padding: 1rem;
    }

    .editor-parent {
        flex: 1;
        overflow-y: auto;
    }

    /*.editor-gutter {*/
    /*    width: 160px;*/
    /*    background-color: #444;*/
    /*    box-shadow: inset -5px 0 10px 2px #222;*/
    /*}*/
</style>