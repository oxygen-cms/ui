<template>
    <b-modal :active="active" trap-focus
             aria-role="dialog"
             aria-modal
             @update:active="arg => $emit('update:active', arg)">
        <div class="modal-card" style="width: auto">
            <header class="modal-card-head">
                <p class="modal-card-title">
                    <slot name="title">Choose an event</slot>
                </p>
                <button
                    type="button"
                    class="delete"
                    @click="$emit('update:active', false)"/>
            </header>
            <section class="modal-card-body full-height-container">
                <slot name="explanation"></slot>
                <b-field>
                    <b-input v-model="searchQuery"
                             placeholder="Search..."
                             type="search" icon="search" rounded>
                    </b-input>
                </b-field>
                <EventsTable :paginated-items="eventsPaginatedItems" :on-page-change="(page) => eventsPaginatedItems.currentPage = page">
                    <template #actions="slotProps">
                        <div class="buttons" style="flex-wrap: nowrap;">
                            <b-button icon-left="calendar-alt" size="is-small" tag="a" :href="'/oxygen/upcoming-events/' + slotProps.row.id + '/edit'" style="margin-left: 0.5rem;" rounded>Go to event</b-button>
                            <b-button rounded :type="disableEvent(slotProps.row) ? '' : 'is-success'" :disabled="disableEvent(slotProps.row)" @click="$emit('selected', slotProps.row)">Choose</b-button>
                        </div>
                    </template>
                </EventsTable>
            </section>
        </div>
    </b-modal>
</template>

<script>
import EventsApi from "../EventsApi";
import EventsTable from './EventsTable.vue';

export default {
    name: "EventsChooser",
    components: { EventsTable },
    props: {
        active: Boolean,
        disableEvent: {
            type: Function,
            default: () => { return false; }
        }
    },
    data() {
        return {
            eventsPaginatedItems: { items: null, itemsPerPage: null, totalItems: null, loading: false, currentPage: null },
            eventsApi: new EventsApi(this.$buefy),
            searchQuery: '',
            searchDebounce: null
        }
    },
    watch: {
        'searchQuery': 'debounceFetchData',
        'eventsPaginatedItems.currentPage': 'fetchData'
    },
    async created() {
        await this.fetchData()
    },
    methods: {
        async fetchData() {
            this.eventsPaginatedItems.loading = true;

            let data = await this.eventsApi.list(false, this.eventsPaginatedItems.currentPage, this.searchQuery !== '' ? this.searchQuery : null);
            this.eventsPaginatedItems.items = data.items;
            this.eventsPaginatedItems.itemsPerPage = data.itemsPerPage;
            this.eventsPaginatedItems.totalItems = data.totalItems;
            this.eventsPaginatedItems.loading = false;
        },
        debounceFetchData() {
            clearTimeout(this.searchDebounce)
            this.searchDebounce = setTimeout(() => {
                this.fetchData();
            }, 400);
        },
    }
}
</script>

<style scoped>

</style>
