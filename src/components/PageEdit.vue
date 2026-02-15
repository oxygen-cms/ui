<template>
    <div v-hotkey="keymap" class="page-edit-new full-height is-flex is-flex-direction-column" :class="{ 'is-fullscreen': isFullscreen }">

        <!-- Version Warning Banner -->
        <div v-if="!isFullscreen && !loading && editingNonHead" :class="(editOverrideConfirmed ? 'has-background-info-light' : 'has-background-warning') + ' px-4 py-4'">
            <div class="is-flex is-align-items-center">
                <b-icon icon="exclamation-triangle" class="mr-2"></b-icon>
                You're viewing a version from {{ formatDate(model.updatedAt) }}. This is not the current version.
                <b-button class="ml-2" type="is-text is-warning" size="is-small" icon-left="pencil-alt" @click="navigateToHeadVersion">Edit Latest</b-button>
            </div>
        </div>

        <!-- Trashed Warning Banner -->
        <div v-if="!isFullscreen && !loading && isTrashed" class="has-background-grey-light px-4 py-4">
            <div class="is-flex is-align-items-center">
                <b-icon icon="trash" class="mr-2"></b-icon>
                This page is in the trash. Editing trashed pages is not recommended.
                <b-button class="ml-2" type="is-text is-dark" size="is-small" icon-left="recycle" @click="restorePage">Restore</b-button>
            </div>
        </div>

        <!-- Header Bar -->
        <div v-if="!isFullscreen" class="header-bar px-4 py-3 is-flex is-align-items-center" style="border-bottom: 1px solid #dbdbdb;">
            <b-button rounded icon-left="angle-left" @click="goBack">Back</b-button>

            <div class="mx-4 is-flex-grow-1">
                <transition name="fade" mode="out-in">
                    <b-skeleton v-if="loading" key="skeleton" width="200px"></b-skeleton>
                    <div v-else-if="!editingTitle" key="display" class="title-display">
                        <span class="title is-4">{{ model.title || 'Untitled Page' }}</span>
                        <b-button rounded size="is-small" type="is-light" icon-left="pencil-alt" @click="startEditingTitle"></b-button>
                        <b-tag v-if="isHeadVersion" type="is-success" size="is-small" class="ml-2" icon="star">
                            Latest version
                        </b-tag>
                        <b-tag v-if="isDirty" type="is-info">Unsaved changes</b-tag>
                    </div>
                    <b-field expanded v-else key="editing" class="title-editing">
                        <b-input
                            ref="titleInput"
                            v-model="editingTitleValue"
                            placeholder="Page Title"
                            expanded
                            class="mr-2"
                            @keyup.enter.native="finishEditingTitle"
                            @keyup.esc.native="cancelEditingTitle"
                        />
                        <b-field>
                            <p class="control">
                                <b-button type="is-primary" @click="finishEditingTitle">Done</b-button>
                            </p>
                            <p class="control">
                                <b-button @click="cancelEditingTitle">Cancel</b-button>
                            </p>
                        </b-field>
                    </b-field>
                </transition>
            </div>

            <div class="is-flex" style="gap: 0.5rem;">
                <b-button
                    v-if="!loading"
                    :disabled="isPublished"
                    :type="isPublished ? '' : 'is-success'"
                    icon-left="globe-asia"
                    @click="isPublished ? null : publish()"
                >
                    {{ isPublished ? 'Published' : 'Publish' }}
                </b-button>
                <b-button
                    v-if="!loading"
                    icon-left="eye"
                    :disabled="isInViewMode"
                    @click="viewFullscreen"
                >
                    View
                </b-button>
                <b-field>
                <p class="control">
                    <b-button icon-left="cog" @click="openPageSettings">Page Settings</b-button>
                </p>
                <p class="control">
                    <b-button icon-left="history" @click="openVersionDrawer">Versions</b-button>
                </p>
                <p class="control">
                    <b-dropdown position="is-bottom-left" aria-role="menu">
                        <template #trigger>
                            <b-button icon-left="bars"></b-button>
                        </template>
                        <b-dropdown-item v-if="isPublished" aria-role="menuitem" @click="viewOnSite">
                            <b-icon icon="external-link-alt"></b-icon>
                            View on Site
                        </b-dropdown-item>
                        <b-dropdown-item aria-role="menuitem" @click="saveAsNewVersion">
                            <b-icon icon="plus"></b-icon>
                            New Version
                        </b-dropdown-item>
                        <b-dropdown-item aria-role="menuitem" @click="confirmDelete">
                            <b-icon icon="trash"></b-icon>
                            Delete
                        </b-dropdown-item>
                    </b-dropdown>
                </p>
                </b-field>
            </div>
        </div>

        <!-- Editor Toolbar -->
        <div v-if="!loading" class="has-background-white-bis px-4 py-3 is-flex is-align-items-center" style="border-bottom: 1px solid #dbdbdb; gap: 1rem;">
            <b-field class="mb-0">
                <p class="control">
                <b-button
                    :type="editorMode === 'code' ? 'is-dark' : ''"
                    @click="switchEditorMode('code')"
                >
                    Code
                </b-button></p>
                <p class="control">
                <b-button
                    :type="editorMode === 'split' ? 'is-dark' : ''"
                    @click="switchEditorMode('split')"
                >
                    Split
                </b-button></p>
                <p class="control">
                <b-button
                    :type="editorMode === 'preview' ? 'is-dark' : ''"
                    @click="switchEditorMode('preview')"
                >
                    Preview
                </b-button></p>
            </b-field>

            <b-button icon-left="image" :disabled="editorMode === 'preview'" @click="isMediaModalActive = true">
                Insert Photo or File
            </b-button>

            <b-switch :value="renderLayout" size="is-small" @input="updateQueryParam('fullPage', $event)">
                Preview full page
            </b-switch>

            <b-switch
                :value="isFullscreen" size="is-small" @input="updateQueryParam('fullscreen', $event)"
            >Focus</b-switch>

            <div class="is-flex-grow-1"></div>

            <b-field>
                <p class="control">
                    <b-dropdown position="is-bottom-left" aria-role="menu">
                        <template #trigger>
                            <b-button :label="versionStrategyLabel" icon-right="caret-down" :disabled="!isDirty" />
                        </template>
                        <b-dropdown-item aria-role="menuitem" @click="versionStrategy = 'guess'">
                            Create New Version if Needed
                        </b-dropdown-item>
                        <b-dropdown-item aria-role="menuitem" @click="versionStrategy = 'new'">
                            Save as New Version
                        </b-dropdown-item>
                        <b-dropdown-item aria-role="menuitem" @click="versionStrategy = 'overwrite'">
                            Overwrite Current Version
                        </b-dropdown-item>
                    </b-dropdown>
                </p>
                <p class="control">
                    <b-button
                        type="is-primary"
                        icon-left="save"
                        :loading="saving"
                        :disabled="!isDirty"
                        @click="save"
                    >
                        Save
                    </b-button>
                </p>
            </b-field>
        </div>

        <!-- Fullscreen Loading -->
        <b-loading :active="loading" :is-full-page="true"></b-loading>

        <!-- Editor Area -->
        <div class="editor-area is-flex-grow-1 is-relative">

            <div v-if="!loading" class="full-height">
                <!-- Code Mode -->
                <CodeEditor
                    v-if="editorMode === 'code'"
                    :key="'code-' + pageId"
                    ref="codeEditor"
                    v-model="model.content"
                    lang="twig"
                    height="100%"
                />

                <!-- Preview Mode -->
                <iframe
                    v-if="editorMode === 'preview'"
                    ref="previewIframe"
                    :srcdoc="previewHtml"
                    class="preview-iframe"
                    frameborder="0"
                ></iframe>

                <!-- Split Mode -->
                <div v-if="editorMode === 'split'" class="split-mode is-flex full-height">
                    <div class="split-left" style="flex: 1; border-right: 1px solid #dbdbdb;">
                        <CodeEditor
                            :key="'split-' + pageId"
                            ref="splitCodeEditor"
                            v-model="model.content"
                            lang="twig"
                            height="100%"
                        />
                    </div>
                    <div class="split-right" style="flex: 1;">
                        <iframe
                            ref="splitPreviewIframe"
                            :srcdoc="previewHtml"
                            class="preview-iframe"
                            frameborder="0"
                        ></iframe>
                    </div>
                </div>
            </div>
        </div>


        <!-- Page Settings Drawer -->
        <transition name="slide-right">
            <div v-if="editPageModalActive" class="settings-drawer">
                <div class="drawer-overlay" @click="editPageModalActive = false"></div>
                <div class="drawer-content">
                    <div class="drawer-header px-4 py-3 has-background-light" style="border-bottom: 1px solid #dbdbdb;">
                        <div class="is-flex is-align-items-center" style="gap: 0.5rem;">
                            <h2 class="title is-5 mb-0 is-flex-grow-1">Page Settings</h2>
                            <b-button
                                type="is-primary"
                                icon-left="save"
                                size="is-small"
                                :loading="saving"
                                :disabled="!isDirty"
                                @click="save"
                            >
                                Save
                            </b-button>
                            <b-button icon-left="times" size="is-small" @click="editPageModalActive = false">Close</b-button>
                        </div>
                    </div>

                    <div class="drawer-body is-relative">
                        <b-loading :active="loading" :is-full-page="false"></b-loading>
                        <div v-if="!loading" class="px-4 py-4">
                            <b-field>
                                <template #label>
                                    URL
                                    <b-tooltip multilined position="is-right" type="is-dark" label="The URL at which this page is located. It can only contain letters, numbers, and dashes.">
                                        <b-icon size="is-small" icon="question-circle"></b-icon>
                                    </b-tooltip>
                                </template>
                                <p class="control">
                                    <b-tooltip label="To change, move this page to another parent."
                                               multilined
                                               type="is-dark"
                                               position="is-right">
                                        <b-button disabled>{{ parentSlug }}/</b-button>
                                    </b-tooltip>
                                </p>
                                <b-input v-model="model.slugPart" placeholder="url-slug" expanded></b-input>
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
                        </div>
                    </div>
                </div>
            </div>
        </transition>

        <!-- Media Insert Modal -->
        <MediaInsertModal
            :active="isMediaModalActive"
            :multiselect-allowed="false"
            @close="isMediaModalActive = false"
            @select="onMediaInserted"
        />

        <!-- Versions Drawer -->
        <VersionsDrawer
            ref="versionsDrawer"
            :active="isVersionDrawerActive"
            :page-id="pageId"
            :current-version-id="model ? model.id : null"
            @update:active="updateQueryParam('versions', $event)"
            @navigate="navigateToVersion"
            @publish="onVersionPublish"
            @make-head="onMakeHeadVersion"
        />
    </div>
</template>

<script>
import CodeEditor from './CodeEditor.vue';
import MediaInsertModal from './media/MediaInsertModal.vue';
import VersionsDrawer from './pages/VersionsDrawer.vue';
import PagesApi from '../PagesApi.js';
import { morphToNotification, getApiHost } from '../api.js';
import { checkForUnsavedChanges } from '../unsavedChanges.js';

export default {
    name: "PageEdit",
    beforeRouteLeave(to, from, next) {
        checkForUnsavedChanges(this.model, this.serverModel, this.$buefy, next);
    },
    components: { CodeEditor, MediaInsertModal, VersionsDrawer },
    data() {
        return {
            loading: true,
            saving: false,
            model: {
                content: '',
                title: '',
                slug: '',
                slugPart: '',
                description: '',
                tags: [],
                meta: '',
                options: '{}',
                stage: 0,
                headVersion: null,
                deletedAt: null
            },
            serverModel: null,
            isMediaModalActive: false,
            editPageModalActive: false,
            versions: [],
            versionsLoading: false,
            versionStrategy: 'guess',
            editingNonHead: false,
            editOverrideConfirmed: false,
            pagesApi: new PagesApi(),
            previewHtml: '',
            previewDebounceTimer: null,
            editingTitle: false,
            editingTitleValue: ''
        }
    },
    computed: {
        pageId() {
            return parseInt(this.$route.params.id);
        },
        isHeadVersion() {
            // headVersion is null for head versions, or an object/ID for historical versions
            if (!this.model) return false;
            const hv = this.model.headVersion;
            return hv === null || hv === undefined;
        },
        isPublished() {
            return this.model && this.model.stage === PagesApi.STAGE_PUBLISHED;
        },
        isTrashed() {
            return this.model && this.model.deletedAt !== null && this.model.deletedAt !== undefined;
        },
        isDirty() {
            if (!this.model || !this.serverModel) return false;
            return this.model.content !== this.serverModel.content ||
                   this.model.title !== this.serverModel.title ||
                   this.model.slugPart !== this.serverModel.slugPart ||
                   this.model.description !== this.serverModel.description ||
                   this.model.meta !== this.serverModel.meta ||
                   this.model.options !== this.serverModel.options ||
                   this.model.stage !== this.serverModel.stage ||
                   this.model.parent !== this.serverModel.parent ||
                   JSON.stringify(this.model.tags) !== JSON.stringify(this.serverModel.tags);
        },
        pageUrl() {
            return this.model ? PagesApi.slugToUrl(this.model.slug) : '';
        },
        needsEditConfirmation() {
            return !this.isHeadVersion && !this.editOverrideConfirmed;
        },
        versionStrategyLabel() {
            switch(this.versionStrategy) {
                case 'new': return 'Save as New Version';
                case 'overwrite': return 'Overwrite Current Version';
                default: return 'Create New Version if Needed';
            }
        },
        versionStrategyIcon() {
            switch(this.versionStrategy) {
                case 'new': return 'plus';
                case 'overwrite': return 'save';
                default: return 'caret-up';
            }
        },
        parentSlug() {
            if (!this.model) return '';
            // If parent exists, return its slug, otherwise return empty string (root level)
            return this.model.parent ? this.model.parent.slug : '';
        },
        defaultEditorMode() {
            // Get from user preferences, default to 'split'
            return this.$store.getters.userPreferences.get('editor.defaultMode') || 'split';
        },
        isInViewMode() {
            // View mode is: preview + fullPage + fullscreen
            return this.editorMode === 'preview' && this.renderLayout === true && this.fullscreen;
        },
        // Query-string-based computed properties (single source of truth)
        editorMode() {
            const mode = this.$route.query.mode;
            if (['code', 'split', 'preview'].includes(mode)) {
                return mode;
            }
            return this.defaultEditorMode;
        },
        renderLayout() {
            return this.$route.query.fullPage === 'true';
        },
        isFullscreen() {
            return this.$route.query.fullscreen === 'true';
        },
        isVersionDrawerActive() {
            return this.$route.query.versions === 'true';
        },
        keymap() {
            return {
                'ctrl+s': this.saveHotkey,
            };
        }
    },
    watch: {
        'model.content': {
            handler(newVal) {
                console.log('model.content changed, length:', newVal ? newVal.length : 0, 'mode:', this.editorMode);
                if (this.editorMode === 'split' || this.editorMode === 'preview') {
                    this.debouncedRefreshPreview();
                }
            }
        },
        '$route.params.id'() {
            // Reload page when route changes (switching between page versions)
            this.editOverrideConfirmed = false; // Reset edit confirmation when switching pages
            this.fetchData();
        },
        '$route.query': {
            handler(newQuery, oldQuery) {
                // Refresh preview when mode or fullPage changes (e.g., via browser back/forward)
                const modeChanged = newQuery.mode !== oldQuery.mode;
                const fullPageChanged = newQuery.fullPage !== oldQuery.fullPage;

                if (modeChanged || fullPageChanged) {
                    if (this.editorMode === 'split' || this.editorMode === 'preview') {
                        this.refreshPreview();
                    }
                }
            },
            deep: true
        }
    },
    mounted() {
        this.fetchData();
    },
    beforeDestroy() {
        if (this.previewDebounceTimer) {
            clearTimeout(this.previewDebounceTimer);
        }
    },
    methods: {
        async saveHotkey(event) {
            event.preventDefault();
            if (this.isDirty) {
                await this.save();
            }
        },
        async fetchData() {
            this.loading = true;
            try {
                const response = await this.pagesApi.get(this.pageId);
                this.setModel(response.item);
                this.editingNonHead = !this.isHeadVersion;
            } catch (error) {
                console.error('Failed to fetch page:', error);
            }
        },
        setModel(model) {
            this.loading = false;
            this.model = { ...model };
            this.serverModel = { ...model };
        },
        async save() {
            this.saving = true;
            try {
                const response = await this.pagesApi.update(this.model);
                this.setModel(response.item);
                this.$buefy.toast.open(morphToNotification(response));
            } catch (error) {
                console.error('Save failed:', error);
            } finally {
                this.saving = false;
            }
        },
        async publish() {
            try {
                const updatedModel = await this.pagesApi.publish(this.model.id);
                this.setModel(updatedModel);
                // Refresh versions list if drawer is open
                if (this.$refs.versionsDrawer && this.isVersionDrawerActive) {
                    await this.$refs.versionsDrawer.loadVersions();
                }
            } catch (error) {
                console.error('Publish failed:', error);
            }
        },
        async refreshPreview() {
            if (!this.model) return;

            try {
                // Use the API endpoint for content preview
                const url = getApiHost() + 'oxygen/api/pages/content/' + this.model.id;
                const response = await this.pagesApi.request('post')
                    .withJson({
                        content: this.model.content,
                        renderLayout: this.renderLayout
                    })
                    .fetchRaw(url);

                this.previewHtml = await response.text();
            } catch (error) {
                console.error('Preview refresh failed:', error);
                this.previewHtml = '<div style="padding: 2rem; color: red;">Preview failed to load</div>';
            }
        },
        debouncedRefreshPreview() {
            if (this.previewDebounceTimer) {
                clearTimeout(this.previewDebounceTimer);
            }
            this.previewDebounceTimer = setTimeout(() => {
                console.log('Debounced preview refresh triggered');
                this.refreshPreview();
            }, 1000);
        },
        onMediaInserted(files) {
            if (files.length === 0) return;

            const file = files[0];
            const snippet = `{{ media('${file.fullPath}') }}`;

            // Get the appropriate editor ref based on mode
            const editorRef = this.editorMode === 'split' ? this.$refs.splitCodeEditor : this.$refs.codeEditor;

            if (editorRef && editorRef.$refs.ace) {
                const editor = editorRef.$refs.ace.editor;
                editor.insert(snippet);
                editor.focus();
            }

            this.isMediaModalActive = false;
        },
        toggleFullscreen() {
            this.updateQueryParam('fullscreen', !this.isFullscreen);
        },
        openVersionDrawer() {
            this.updateQueryParam('versions', true);
        },
        viewOnSite() {
            window.open(this.pageUrl, '_blank');
        },
        viewFullscreen() {
            // Navigate to fullscreen preview mode with full page layout
            this.navigateToVersion(this.pageId, {
                fullscreen: true,
                fullPage: true,
                mode: 'preview'
            });
        },
        saveAsNewVersion() {
            this.versionStrategy = 'new';
            this.save();
        },
        async confirmDelete() {
            this.$buefy.dialog.confirm({
                message: 'Are you sure you want to delete this page? You can restore it later from the trash if needed.',
                confirmText: 'Delete',
                type: 'is-danger',
                onConfirm: async () => {
                    await this.pagesApi.deleteAndNotify(this.model.id);
                    await this.fetchData();
                }
            });
        },
        navigateToVersion(versionId, options = {}) {
            const query = {};

            // Handle versions drawer state
            if (options.versions !== undefined) {
                // Explicitly set versions state if provided
                query.versions = options.versions.toString();
            } else if (this.isVersionDrawerActive && !options.fullscreen) {
                // Otherwise, preserve versions=true unless it's a fullscreen view action
                query.versions = 'true';
            }

            // Add any additional query params from options
            if (options.fullscreen !== undefined) {
                query.fullscreen = options.fullscreen.toString();
            }
            if (options.fullPage !== undefined) {
                query.fullPage = options.fullPage.toString();
            }
            if (options.mode) {
                query.mode = options.mode;
            }

            this.$router.push({
                name: 'pages.editNew',
                params: { id: versionId },
                query
            });
        },
        navigateToHeadVersion() {
            if (this.model.headVersion) {
                this.$router.push({ name: 'pages.editNew', params: { id: this.model.headVersion } });
            }
        },
        async onVersionPublish(versionId) {
            await this.pagesApi.publish(versionId);
            // Always refresh the current page since publishing one version might unpublish another
            await this.fetchData();
        },
        async onMakeHeadVersion(versionId) {
            await this.pagesApi.makeHeadVersion(versionId);
            await this.fetchData();
        },
        formatDate(dateString) {
            return new Date(dateString).toLocaleDateString();
        },
        updateQueryParam(key, value) {
            const query = { ...this.$route.query };
            // Handle different value types
            if (typeof value === 'boolean') {
                query[key] = value.toString();
            } else if (typeof value === 'string') {
                query[key] = value;
            } else if (value === null || value === undefined) {
                delete query[key];
            } else {
                query[key] = String(value);
            }
            // Only update if query actually changed
            if (JSON.stringify(query) !== JSON.stringify(this.$route.query)) {
                this.$router.replace({ query }).catch(() => {});
            }
        },
        switchEditorMode(newMode) {
            // Check if we need confirmation before switching to an editable mode
            if (this.needsEditConfirmation && (newMode === 'code' || newMode === 'split')) {
                this.$buefy.dialog.confirm({
                    title: 'Edit Historical Version',
                    message: 'You are about to edit a historical version of this page. This is not the current version. Are you sure you want to continue?',
                    confirmText: 'Edit Anyway',
                    type: 'is-warning',
                    onConfirm: () => {
                        this.editOverrideConfirmed = true;
                        this.updateQueryParam('mode', newMode);
                    }
                });
            } else {
                this.updateQueryParam('mode', newMode);
            }
        },
        openPageSettings() {
            // Check if we need confirmation before opening settings
            if (this.needsEditConfirmation) {
                this.$buefy.dialog.confirm({
                    title: 'Edit Historical Version',
                    message: 'You are about to edit a historical version of this page. This is not the current version. Are you sure you want to continue?',
                    confirmText: 'Edit Anyway',
                    type: 'is-warning',
                    onConfirm: () => {
                        this.editOverrideConfirmed = true;
                        this.editPageModalActive = true;
                    }
                });
            } else {
                this.editPageModalActive = true;
            }
        },
        goBack() {
            if (this.isTrashed) {
                this.$router.push({ name: 'pages.trash' });
            } else {
                this.$router.push({ name: 'pages.list' });
            }
        },
        async restorePage() {
            try {
                await this.pagesApi.restoreAndNotify(this.model.id);
                await this.fetchData();
            } catch (error) {
                console.error('Restore failed:', error);
            }
        },
        startEditingTitle() {
            this.editingTitleValue = this.model.title;
            this.editingTitle = true;
            this.$nextTick(() => {
                if (this.$refs.titleInput) {
                    this.$refs.titleInput.focus();
                }
            });
        },
        finishEditingTitle() {
            this.model.title = this.editingTitleValue;
            this.editingTitle = false;
        },
        cancelEditingTitle() {
            this.editingTitle = false;
            this.editingTitleValue = '';
        }
    }
}
</script>

<style scoped>
.page-edit-new {
    background: white;
}

.page-edit-new.is-fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    background: white;
}

.full-height {
    height: 100%;
}

.title-display {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.title-display .title {
    margin: 0;
}

.title-editing {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    max-width: 40rem;
}

.editor-area {
    overflow: hidden;
}

.preview-iframe {
    width: 100%;
    height: 100%;
    border: none;
    background: white;
}

.split-mode {
    gap: 0;
}

/* Fade transition for mode switching */
.fade-enter-active, .fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter, .fade-leave-to {
    opacity: 0;
}

/* Settings drawer styles */
.settings-drawer {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 40;
    pointer-events: none;
}

.settings-drawer .drawer-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    pointer-events: all;
}

.settings-drawer .drawer-content {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 500px;
    max-width: 90vw;
    background: white;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    pointer-events: all;
}

.settings-drawer .drawer-header {
    flex-shrink: 0;
}

.settings-drawer .drawer-body {
    flex: 1;
    overflow-y: auto;
}

/* Slide transition from right */
.slide-right-enter-active,
.slide-right-leave-active {
    transition: transform 0.3s ease;
}

.slide-right-enter-active .drawer-overlay,
.slide-right-leave-active .drawer-overlay {
    transition: opacity 0.3s ease;
}

.slide-right-enter .drawer-content,
.slide-right-leave-to .drawer-content {
    transform: translateX(100%);
}

.slide-right-enter .drawer-overlay,
.slide-right-leave-to .drawer-overlay {
    opacity: 0;
}
</style>
