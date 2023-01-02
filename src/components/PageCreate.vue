<template>
    <div class="full-height">
<!--        <h1>Create Page</h1>-->
        <ContentEditor :editable="editable" :expanded="true" :content="content" @update:content="v => content = v" />
        <b-checkbox :value="editable" @input="v => editable = v">Is Editable?</b-checkbox>
    </div>
</template>

<script>
import ContentEditor from "./content/ContentEditor.vue";
export default {
    name: "PageCreate",
    components: {ContentEditor},
    data() {
        return {
            editable: true,
            content: { type: 'doc', content: [{type:'paragraph',content:[{type:'text',text:'I’m running Tiptap with Vue.js. 🎉'}]}]}
        }
    }
}
</script>

<style scoped>
    @import "../components/util.css";
</style>