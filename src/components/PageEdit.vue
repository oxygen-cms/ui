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
  >
    <!-- Page-specific settings fields -->
    <template #settings-drawer-fields="{ model }">
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
            <b-button disabled>{{ model.parent ? model.parent.slug : '' }}/</b-button>
          </b-tooltip>
        </p>
        <b-input v-model="model.slugPart" placeholder="url-slug" expanded></b-input>
      </b-field>
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
import ContentResourceEdit from './ContentResourceEdit.vue';
import PagesApi from '../PagesApi.js';

export default {
  name: "PageEdit",
  components: { ContentResourceEdit },
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
    }
  }
}
</script>
