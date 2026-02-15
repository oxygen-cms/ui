<template>
  <ContentResourceEdit
    :resource-api="pagesApi"
    display-name="Page"
    route-prefix="pages"
    list-route-name="pages.list"
    trash-route-name="pages.trash"
    :published-stage="STAGE_PUBLISHED"
    :has-slug="true"
    :has-hierarchy="true"
    :has-version-actions="true"
    :has-full-page-preview="true"
  >
    <!-- Page-specific settings fields -->
    <template #settings-drawer-fields="{ model }">
      <b-field>
        <template #label>
          URL
          <b-tooltip multilined position="is-right" type="is-dark" label="The URL at which this page is located. Change the parent page to update the path prefix.">
            <b-icon size="is-small" icon="question-circle"></b-icon>
          </b-tooltip>
        </template>
        <p class="control">
          <PageChooseParent
            ref="parentChooser"
            :current-parent-id="model.parent"
            :exclude-page-id="model.id"
            :show-slug="true"
            @select="moveToParent($event, model)"
          />
        </p>
        <p class="control">
          <b-button disabled style="border-left: 0; border-radius: 0;">/</b-button>
        </p>
        <b-input v-model="model.slugPart" placeholder="url-slug" expanded></b-input>
      </b-field>

      <b-field label="Description">
        <b-input v-model="model.description" type="textarea" placeholder="Page description"></b-input>
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
    </template>

    <!-- Page-specific dropdown actions -->
    <template #dropdown-actions="{ model, isPublished }">
      <b-dropdown-item
        v-if="isPublished"
        aria-role="menuitem"
        @click="viewOnSite(model)"
      >
        <b-icon icon="external-link-alt"></b-icon>
        View on Site
      </b-dropdown-item>
    </template>

    <!-- Version-specific actions (e.g., View on Site for published versions) -->
    <template #version-dropdown-actions="{ version, isPublished }">
      <b-dropdown-item
        v-if="isPublished"
        aria-role="menuitem"
        @click="viewVersionOnSite(version)"
      >
        <b-icon icon="external-link-alt"></b-icon>
        View on Site
      </b-dropdown-item>
    </template>
  </ContentResourceEdit>
</template>

<script>
import ContentResourceEdit from '../ContentResourceEdit.vue';
import CodeEditor from '../CodeEditor.vue';
import PageChooseParent from './PageChooseParent.vue';
import PagesApi from '../../PagesApi.js';
import { morphToNotification } from '../../api.js';

export default {
  name: "PageEdit",
  components: { ContentResourceEdit, CodeEditor, PageChooseParent },
  data() {
    return {
      pagesApi: new PagesApi(),
      STAGE_PUBLISHED: PagesApi.STAGE_PUBLISHED
    }
  },
  methods: {
    viewOnSite(model) {
      const url = PagesApi.slugToUrl(model.slug || model.slugPart);
      window.open(url, '_blank');
    },
    viewVersionOnSite(version) {
      const url = PagesApi.slugToUrl(version.slug);
      window.open(url, '_blank');
    },
    async moveToParent(parentPage, model) {
      try {
        const data = await this.pagesApi.update({
          id: model.id,
          parent: parentPage.id,
          autoConvertToDraft: 'no',
          version: false
        });
        this.$buefy.toast.open(morphToNotification(data));

        // Tell PageChooseParent to reload the NEW parent for display (use parentPage.id, not model.parent)
        this.$nextTick(() => {
          if (this.$refs.parentChooser) {
            this.$refs.parentChooser.loadCurrentParent(parentPage.id);
          }
        });
      } catch (error) {
        console.error('Failed to move page:', error);
        this.$buefy.toast.open({
          message: 'Failed to move page',
          type: 'is-danger'
        });
      }
    }
  }
}
</script>
