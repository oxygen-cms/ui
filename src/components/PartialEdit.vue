<template>
  <ContentResourceEdit
    :resource-api="partialsApi"
    display-name="Partial"
    route-prefix="partials"
    list-route-name="partials.list"
    trash-route-name="partials.trash"
    :published-stage="STAGE_PUBLISHED"
    :has-slug="false"
    :has-hierarchy="false"
  >
    <!-- Partial-specific settings fields -->
    <template #settings-drawer-fields="{ model }">
      <b-field label="Key">
        <template #label>
          Key
          <b-tooltip multilined position="is-right" type="is-dark"
                     label="A unique machine-readable identifier for this partial (e.g., 'footer.copyright', 'header.navigation')">
            <b-icon size="is-small" icon="question-circle"></b-icon>
          </b-tooltip>
        </template>
        <b-input v-model="model.key" placeholder="e.g., footer.copyright" />
      </b-field>

      <b-field label="Author">
        <b-input v-model="model.author" placeholder="Author name" />
      </b-field>
    </template>

    <!-- No dropdown-actions slot needed - partials don't have "View on Site" -->
    <!-- No version-dropdown-actions slot needed either -->
  </ContentResourceEdit>
</template>

<script>
import ContentResourceEdit from './ContentResourceEdit.vue';
import PartialsApi from '../PartialsApi.js';

export default {
  name: "PartialEdit",
  components: { ContentResourceEdit },
  data() {
    return {
      partialsApi: new PartialsApi(),
      STAGE_PUBLISHED: PartialsApi.STAGE_PUBLISHED
    }
  }
}
</script>
