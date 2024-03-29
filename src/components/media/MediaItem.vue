<template>
    <div class="media-item card" :class="item.selected ? 'media-item-selected' : ''" >
        <div class="card-image cursor-pointer" @click.exact="select(true)" @click.shift.exact="select(false)">
            <MediaItemPreview :item="item" />
        </div>
        <div class="card-content">
            <p class="title is-4 cursor-pointer has-text-centered" @click.exact="select(true)" @click.shift.exact="select(false)">{{ item.name }}</p>
            <p v-if="displayFullPath" class="subtitle is-6 cursor-pointer has-text-centered" @click.exact="select(true)" @click.shift.exact="select(false)">
                inside '{{ directoryPath }}'
<!--                <b-icon icon="file-image" v-if="item.type === TYPE_IMAGE"></b-icon>-->
<!--                <b-icon icon="file" v-else-if="item.type === TYPE_DOCUMENT"></b-icon>-->
<!--                <b-icon icon="file-audio" v-else-if="item.type === TYPE_AUDIO"></b-icon>-->
<!--                {{ item.slug }}.{{ item.extension }}-->
            </p>

            <div v-if="item.selected" class="content media-item-toolbar">
                <b-button icon-left="photo-video" size="is-small" rounded tag="a" :href="externalLink">View</b-button>
                <b-button icon-left="pencil-alt" size="is-small" rounded @click="openEditModal">Edit info</b-button>
                <MediaChooseDirectory v-if="!item.deletedAt" @submit="moveToDirectory"></MediaChooseDirectory>
                <b-button v-if="!item.deletedAt" icon-left="share" size="is-small" rounded outlined @click="isShareModalActive = true">Share</b-button>
                <b-button v-if="!item.deletedAt" icon-left="trash" size="is-small" rounded outlined type="is-danger" @click="deleteItem">Delete</b-button>
                <b-button v-if="item.deletedAt" icon-left="recycle" size="is-small" rounded outlined @click="restoreItem">Restore</b-button>
                <b-button v-if="item.deletedAt" icon-left="trash" size="is-small" rounded outlined type="is-danger" @click="confirmForceDeleteItem">Delete forever</b-button>
            </div>
        </div>

        <b-modal :active.sync="isShareModalActive" trap-focus has-modal-card width="80%">
            <div class="modal-card" style="width: auto;">
                <header class="modal-card-head">
                    <p class="modal-card-title">Share a public link</p>
                </header>
                <section class="modal-card-body">
                    <p>When referencing "{{ item.name }}" externally, use the following URL:<br/>
                    <a :href="externalLink">{{ externalLink }}</a>
                    </p>
                    <br />

                    <p>To use this item within Oxygen, use the <em>"Insert Photo or File"</em> button inside the content editor.</p>
                </section>
                <footer class="modal-card-foot is-flex">
                    <div class="is-flex-grow-1"></div>
                    <b-button
                        label="Close"
                        @click="isShareModalActive = false" />
                </footer>
            </div>
        </b-modal>

        <b-modal v-hotkey="keymap" :active.sync="isEditModalActive" trap-focus has-modal-card width="80%">
            <div class="modal-card" style="width: auto">
                <header class="modal-card-head">
                    <p class="modal-card-title">Edit Media Item - {{ name }}</p>
                </header>
                <section class="modal-card-body">
                    <b-field label="Name">
                        <b-input v-model="name"></b-input>
                    </b-field>
                    <b-field>
                        <template #label>
                            Slug
                            <b-tooltip multilined position="is-right" type="is-dark" label="How this item is referenced in code. If left blank, it will be autogenerated.">
                                <b-icon size="is-small" icon="question-circle"></b-icon>
                            </b-tooltip>
                        </template>
                        <p class="control">
                            <b-tooltip label="To change, move this item to another directory."
                                       multilined
                                       type="is-dark"
                                       position="is-right">
                                <b-button disabled>{{ directorySlug }}/</b-button>
                            </b-tooltip>
                        </p>
                        <b-input v-model="slug" placeholder="will be set from 'Name'" expanded></b-input>
                        <p class="control">
                            <b-tooltip label="The extension is set from the file type."
                                       multilined
                                       type="is-dark"
                                       position="is-left">
                                <b-button disabled>.{{ item.extension }}</b-button>
                            </b-tooltip>
                        </p>
                    </b-field>
                    <b-field label="Author">
                        <b-input v-model="author"></b-input>
                    </b-field>
                    <b-field>
                        <template #label>
                            Caption
                            <b-tooltip multilined position="is-right" type="is-dark" label="May be displayed next to the item, or used as alt-text for vision-impaired.">
                                <b-icon size="is-small" icon="question-circle"></b-icon>
                            </b-tooltip>
                        </template>
                        <b-input v-model="caption"></b-input>
                    </b-field>
                    <b-field>
                        <template #label>
                            Description
                            <b-tooltip multilined position="is-right" type="is-dark" label="Arbitrary extra details/notes - will not be shown to the public.">
                                <b-icon size="is-small" icon="question-circle"></b-icon>
                            </b-tooltip>
                        </template>
                        <b-input v-model="description" type="textarea"></b-input>
                    </b-field>

                    <label class="label">
                        Variants
                        <b-tooltip multilined position="is-right" type="is-dark" label="Each uploaded media item will be automatically converted into different sizes/formats to serve optimized images to users.">
                            <b-icon size="is-small" icon="question-circle"></b-icon>
                        </b-tooltip>
                    </label>
                    <b-table striped :data="variants" :default-sort="['width']">
                        <b-table-column v-slot="props" label="Filename" field="filename"><a :href="'/content/media/' + props.row.filename">{{ props.row.filename }}</a></b-table-column>
                        <b-table-column v-slot="props" label="Width (px)" field="width" sortable>{{ props.row.width ? props.row.width : 'Full size' }}</b-table-column>
                        <b-table-column v-slot="props" label="Format" field="mime" sortable>{{ props.row.mime }}</b-table-column>
                    </b-table>

                    <label class="label">Versions</label>

                    <b-table striped :data="versions"
                             :loading="versions.length === 0"
                             custom-row-key="id"
                             detailed
                             detail-key="id">
                        <b-table-column v-slot="props" label="Name" field="name">{{ props.row.name }}</b-table-column>
                        <b-table-column v-slot="props" label="Path" field="fullPath">{{ props.row.fullPath }}</b-table-column>
                        <b-table-column v-slot="props" label="Last Updated" field="updatedAt">
                            <div class="is-size-7">{{ Internationalize.formatLastUpdated(props.row.updatedAt) }}</div>
                        </b-table-column>

                        <b-table-column v-slot="slotProps" label="">
                            <b-button rounded :disabled="slotProps.row.headVersion === null" @click="restoreVersion(slotProps.row.id)">
                                <span v-if="slotProps.row.headVersion === null">Already current</span>
                                <span v-else>Restore version</span>
                            </b-button>
                        </b-table-column>

                        <template slot="detail" slot-scope="props">
                            <article class="media">
                                <div class="media-content">
                                    <div class="content">
                                        <p>
                                            <strong>Author: </strong><span v-if="props.row.author">{{ props.row.author }}</span><em v-else>none</em><br>
                                            <strong>Caption: </strong><span v-if="props.row.caption">{{ props.row.caption }}</span><em v-else>none</em><br>
                                            <strong>Description: </strong><span v-if="props.row.description">{{ props.row.description }}</span><em v-else>none</em><br>
                                        </p>
                                    </div>
                                </div>
                            </article>
                        </template>
                    </b-table>
                </section>
                <footer class="modal-card-foot is-flex">
                    <div class="is-flex-grow-1"></div>
                    <b-button @click="isEditModalActive = false">Close</b-button>
                    <b-button type="is-primary" @click="saveEdits">Save</b-button>
                </footer>
            </div>
        </b-modal>
    </div>
</template>

<script>

import {morphToNotification} from "../../api";
import MediaApi from "../../MediaApi";
import MediaChooseDirectory from "./MediaChooseDirectory.vue";
import Internationalize from "../../Internationalize";
import {getDirectoryFullSlug, getDirectoryPathString} from "../../MediaDirectoryApi";
import MediaItemPreview from "./MediaItemPreview.vue";

export default {
    name: "MediaItem",
    components: {MediaChooseDirectory, MediaItemPreview},
    props: {
        item: { type: Object, required: true },
        displayFullPath: Boolean
    },
    data() {
        return {
            isEditModalActive: false,
            isShareModalActive: false,
            name: null,
            author: null,
            slug: null,
            versions: [],
            caption: null,
            description: null,
            mediaApi: new MediaApi(),
            Internationalize
        }
    },
    computed: {
        keymap() {
            return {
                'ctrl+s': (event) => {
                    this.saveEdits();
                    event.preventDefault();
                }
            }
        },
        variants() {
            return this.item.variants;
        },
        externalLink() {
            return window.location.origin + '/media/' + this.item.fullPath;
        },
        directoryPath() {
            return getDirectoryPathString(this.item.parentDirectory);
        },
        directorySlug() {
            return getDirectoryFullSlug(this.item.parentDirectory);
        }
    },
    methods: {
        select(toggle) {
            if(this.item.selected) {
                this.$emit('double-click-action', this.item);
                return;
            }
            this.$emit('select', this.item, toggle);
        },
        openEditModal() {
            this.isEditModalActive = true;
            this.name = this.item.name;
            this.author = this.item.author;
            this.slug = this.item.slug;
            this.caption = this.item.caption;
            this.description = this.item.description;
            this.fetchVersions();
        },
        async fetchVersions() {
            this.versions = [];
            this.versions = (await this.mediaApi.listVersions(this.item.id)).items;
        },
        async saveEdits() {
            let data = await this.mediaApi.update({
                id: this.item.id,
                parentDirectory: this.item.parentDirectory,
                name: this.name,
                author: this.author,
                slug: this.slug,
                caption: this.caption,
                description: this.description
            });
            this.$buefy.toast.open(morphToNotification(data));
            this.isEditModalActive = false;
            this.$emit('update:item', data.item);
        },
        async restoreItem() {
            await this.mediaApi.restoreAndNotify(this.item.id);
            this.$emit('update:item', this.item);
        },
        async confirmForceDeleteItem() {
            await this.mediaApi.confirmForceDelete(this.item.id);
            this.$emit('update:item', null);
        },
        async deleteItem() {
            await this.mediaApi.deleteAndNotify(this.item.id);
            this.$emit('update:item', this.item);
        },
        async restoreVersion(id) {
            let data = await this.mediaApi.makeHeadVersion(id);
            this.$buefy.toast.open(morphToNotification(data));
            this.versions = [];
            this.isEditModalActive = false;
        },
        async moveToDirectory(directory) {
            console.log('move to directory', directory);
            let data = await this.mediaApi.update({
                id: this.item.id,
                parentDirectory: directory
            });
            this.$buefy.toast.open(morphToNotification(data));
            this.$emit('update:item', this.item);
        }
    }
}
</script>

<style scoped lang="scss">
    @import './media.scss';
</style>
