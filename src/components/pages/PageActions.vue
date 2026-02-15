<template>
    <div class="page-actions">
        <b-button v-if="item.stage !== STAGE_PUBLISHED" rounded size="is-small" icon-left="globe-asia" class="mr-2" @click="publish">Publish</b-button>

        <b-button rounded size="is-small" icon-left="folder-open" class="mr-2" @click="isMoveModalActive = true">Move</b-button>

        <b-modal v-model="isMoveModalActive" has-modal-card trap-focus aria-role="dialog" aria-modal>
            <div class="modal-card choose-parent-modal" style="width: 640px">
                <header class="modal-card-head">
                    <p class="modal-card-title">Move "{{ item.title }}"</p>
                    <button type="button" class="delete" @click="isMoveModalActive = false"/>
                </header>
                <section class="modal-card-body choose-parent-modal-body">
                    <PageChooseParent
                        :current-parent-id="item.parent"
                        :exclude-page-id="item.id"
                        label="Parent Page"
                        @select="setParentPage"
                    />
                </section>
                <footer class="modal-card-foot is-flex is-justify-content-flex-end">
                    <b-button label="Close" @click="isMoveModalActive = false" />
                </footer>
            </div>
        </b-modal>
    </div>
</template>

<script>
import PagesApi from "../../PagesApi.js";
import {morphToNotification} from "../../api.js";
import PageChooseParent from "./PageChooseParent.vue";

export default {
    name: "PageActions",
    components: { PageChooseParent },
    props: {
        item: { type: Object, required: true }
    },
    data() {
        return {
            STAGE_PUBLISHED: PagesApi.STAGE_PUBLISHED,
            pagesApi: new PagesApi(),
            isMoveModalActive: false
        }
    },
    methods: {
        async publish() {
            let item = await this.pagesApi.publish(this.item.id);
            this.$emit('update', item);
        },
        async setParentPage(parentPage) {
            let data = await this.pagesApi.update({id: this.item.id, parent: parentPage.id, autoConvertToDraft: 'no', version: false});
            this.$buefy.toast.open(morphToNotification(data));
            this.isMoveModalActive = false;
            this.$emit('reload');
        }
    }
}
</script>


<style scoped>
.choose-parent-modal, .choose-parent-modal-body{
    overflow: visible;
}
</style>