<template>
    <MediaList :current-path="currentPath" :in-trash="inTrash" :search-query="searchQuery" @navigate="onNavigate" @double-click-action="viewItem" />
</template>

<script>
import MediaList from './MediaList.vue';

export default {
    name: "MediaPage",
    components: { MediaList },
    props: {
        currentPath: {
            type: String,
            default: ''
        },
        inTrash: {
            type: Boolean,
            default: false
        },
        searchQuery: {
            type: String,
            default: null
        }
    },
    methods: {
        onNavigate(options) {
            if(typeof options.searchQuery !== 'undefined' && options.searchQuery !== null && options.searchQuery !== '') {
                this.$router.push({ name: 'media.search', params: { searchQuery: options.searchQuery }});
            } else if(options.inTrash) {
                this.$router.push({ name: 'media.trash' });
            } else {
                this.$router.push({ name: 'media.list', params: { currentPath: options.currentPath } });
            }
        },
        viewItem(item) {
            window.location.href = '/media/' + item.fullPath;
        }
    }
}
</script>

<style scoped>

</style>
