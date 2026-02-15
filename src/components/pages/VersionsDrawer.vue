<template>
    <transition name="slide-right">
        <div v-if="active" class="versions-drawer">
            <div class="drawer-overlay" @click="close"></div>
            <div class="drawer-content">
                <div class="drawer-header px-4 py-3 has-background-light" style="border-bottom: 1px solid #dbdbdb;">
                    <div class="is-flex is-align-items-center">
                        <h2 class="title is-5 mb-0 is-flex-grow-1">Version History</h2>
                        <b-button icon-left="times" size="is-small" @click="close">Close</b-button>
                    </div>
                </div>

                <div class="drawer-body is-relative">
                    <b-loading :active="versionsLoading" :is-full-page="false"></b-loading>

                    <div v-if="!versionsLoading && versions.length === 0" class="has-text-centered py-6 has-text-grey">
                        No versions found
                    </div>

                    <div v-for="version in versions" :key="version.id" class="version-row px-4 py-3" :class="{ 'is-current': isHeadVersion(version), 'is-editing': version.id === currentVersionId }">
                        <div class="is-flex is-align-items-start">
                            <div class="is-flex-grow-1">
                                <div class="is-flex is-align-items-center mb-1">
                                    <strong>{{ version.title }}</strong>
                                    <b-tag v-if="version.id === currentVersionId" type="is-primary" size="is-small" class="ml-2">
                                        <span class="ml-1">This version</span>
                                    </b-tag>
                                    <b-tag v-if="isHeadVersion(version)" type="is-success" size="is-small" class="ml-2" icon="star">
                                        Latest
                                    </b-tag>
                                </div>
                                <div class="is-size-7 has-text-grey">
                                    <span v-if="version.updatedBy">{{ version.updatedBy.fullName }} • </span>
                                    {{ formatDateTime(version.updatedAt) }}
                                </div>
                            </div>

                            <b-field class="is-flex" style="gap: 0.25rem;">
                                <p class="control">
                                <b-button
                                    icon-left="globe-asia"
                                    size="is-small"
                                    :disabled="version.stage == publishedStage"
                                    @click="publishVersion(version)"
                                >
                                    {{ version.stage == publishedStage ? 'Published' : 'Publish' }}
                                </b-button></p>

                                <p class="control">
                                <b-button icon-left="eye" size="is-small" @click="viewVersion(version)">
                                    View
                                </b-button></p>

                                <p class="control">
                                <b-button
                                    v-if="version.id !== currentVersionId"
                                    icon-left="pencil-alt"
                                    size="is-small"
                                    @click="editVersion(version)"
                                >
                                    Edit
                                </b-button></p>

                                <p class="control">
                                    <b-dropdown
                                        :disabled="shouldDisableDropdown(version)"
                                        position="is-bottom-left"
                                        aria-role="menu">
                                        <template #trigger>
                                            <b-button icon-left="bars" size="is-small"></b-button>
                                        </template>

                                        <!-- SLOT: Resource-specific actions (e.g., "View on Site" for pages) -->
                                        <slot
                                            name="version-dropdown-actions"
                                            :version="version"
                                            :is-published="version.stage === publishedStage"
                                        ></slot>

                                        <b-dropdown-item
                                            v-if="!isHeadVersion(version)"
                                            aria-role="menuitem"
                                            @click="makeHeadVersion(version)"
                                        >
                                            <b-icon icon="arrow-up"></b-icon>
                                            Promote to Latest Version
                                        </b-dropdown-item>

                                        <b-dropdown-item
                                            v-if="version.deletedAt"
                                            aria-role="menuitem"
                                            @click="restoreVersion(version)"
                                        >
                                            <b-icon icon="recycle"></b-icon>
                                            Restore Version
                                        </b-dropdown-item>

                                        <b-dropdown-item
                                            v-if="!isHeadVersion(version) && !version.deletedAt"
                                            aria-role="menuitem"
                                            @click="deleteVersion(version)"
                                        >
                                            <b-icon icon="trash"></b-icon>
                                            Delete Version
                                        </b-dropdown-item>
                                    </b-dropdown>
                                </p>
                            </b-field>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
export default {
    name: "VersionsDrawer",
    props: {
        active: {
            type: Boolean,
            default: false
        },
        resourceId: {
            type: Number,
            required: true
        },
        currentVersionId: {
            type: Number,
            default: null
        },
        resourceApi: {
            type: Object,
            required: true
        },
        publishedStage: {
            type: Number,
            required: true
        },
        hasVersionActions: {
            type: Boolean,
            default: false  // e.g., true for pages (View on Site), false for partials
        }
    },
    data() {
        return {
            versions: [],
            versionsLoading: false
        }
    },
    watch: {
        active(newVal) {
            if (newVal) {
                this.loadVersions();
            }
            this.$emit('update:active', newVal);
        }
    },
    mounted() {
        // Load versions if drawer is active on initial mount (e.g., from URL query param)
        if (this.active) {
            this.loadVersions();
        }
    },
    methods: {
        shouldDisableDropdown(version) {
            const isHead = this.isHeadVersion(version);
            const isPublished = version.stage === this.publishedStage;
            const isDeleted = version.deletedAt;

            // Disable if head version that's not published and not deleted (original behavior)
            if (isHead && !isPublished && !isDeleted) {
                return true;
            }

            // Also disable if no actions will be available
            const hasPromoteAction = !isHead;
            const hasRestoreAction = isDeleted;
            const hasDeleteAction = !isHead && !isDeleted;
            const hasSlotActions = this.hasVersionActions && isPublished;

            const hasAnyAction = hasPromoteAction || hasRestoreAction || hasDeleteAction || hasSlotActions;

            return !hasAnyAction;
        },
        async loadVersions() {
            this.versionsLoading = true;
            try {
                const response = await this.resourceApi.listVersions(this.resourceId);
                this.versions = response.items || [];
            } catch (error) {
                console.error('Failed to load versions:', error);
            } finally {
                this.versionsLoading = false;
            }
        },
        close() {
            this.$emit('update:active', false);
        },
        isHeadVersion(version) {
            return version.headVersion === null;
        },
        formatDateTime(dateString) {
            const date = new Date(dateString);
            return date.toLocaleString();
        },
        async publishVersion(version) {
            this.$emit('publish', version.id);
            await this.loadVersions();
        },
        viewVersion(version) {
            // Open in fullscreen preview mode with full page layout, close versions drawer
            this.$emit('navigate', version.id, {
                fullscreen: true,
                fullPage: true,
                mode: 'preview',
                versions: false
            });
        },
        editVersion(version) {
            const options = {};

            // Only force preview mode for non-head versions (historical versions)
            if (!this.isHeadVersion(version)) {
                options.mode = 'preview';
            }
            // For head versions, don't set mode - let the component use user's default preference

            this.$emit('navigate', version.id, options);
            // Don't close the drawer - the parent will handle navigation with query param
        },
        async makeHeadVersion(version) {
            this.$buefy.dialog.confirm({
                message: `Promote this version to the latest version? The existing 'latest' will become a historical version instead.`,
                confirmText: 'Make Current',
                type: 'is-warning',
                onConfirm: async () => {
                    this.$emit('make-head', version.id);
                    await this.loadVersions();
                }
            });
        },
        deleteVersion(version) {
            this.$buefy.dialog.confirm({
                message: `Are you sure you want to delete this version? This cannot be undone.`,
                confirmText: 'Delete Version',
                type: 'is-danger',
                onConfirm: async () => {
                    try {
                        await this.resourceApi.delete(version.id);
                        this.$buefy.toast.open({
                            message: 'Version deleted successfully',
                            type: 'is-success'
                        });
                        await this.loadVersions();
                    } catch (error) {
                        console.error('Failed to delete version:', error);
                        this.$buefy.toast.open({
                            message: 'Failed to delete version',
                            type: 'is-danger'
                        });
                    }
                }
            });
        },
        async restoreVersion(version) {
            try {
                await this.resourceApi.restoreAndNotify(version.id);
                await this.loadVersions();
            } catch (error) {
                console.error('Failed to restore version:', error);
                this.$buefy.toast.open({
                    message: 'Failed to restore version',
                    type: 'is-danger'
                });
            }
        }
    }
}
</script>

<style scoped lang="scss">
@import "../../styles/_variables.scss";
.versions-drawer {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 40;
    pointer-events: none;
}

.drawer-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    pointer-events: all;
}

.drawer-content {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 700px;
    max-width: 90vw;
    background: white;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    pointer-events: all;
}

.drawer-header {
    flex-shrink: 0;
}

.drawer-body {
    flex: 1;
    overflow-y: auto;
}

.version-row {
    border-bottom: 1px solid #f5f5f5;
    transition: background-color 0.2s;
}

.version-row:hover {
    background-color: #fafafa;
}

.version-row.is-current {
    background-color: $success-light;
}

.version-row.is-current:not(.is-editing) {
    border-left: 4px solid $success;
    padding-left: calc(1rem - 4px);
}

.version-row.is-editing {
    background-color: $info-light;
    border-left: 4px solid $info;
    padding-left: calc(1rem - 4px);
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
