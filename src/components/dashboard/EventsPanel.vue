<template>
    <article>
        <p class="title">Events<b-icon icon="calendar-alt" size="is-medium"></b-icon></p>
        <p class="subtitle">Promotion for upcoming concerts and events</p>
        <div class="buttons">
            <b-button tag="router-link" to="/upcoming-events" icon-left="list">Manage Events</b-button>
            <b-button tag="router-link" to="/upcoming-events/create" icon-left="plus" type="is-success">Create New Event</b-button>
        </div>
    </article>
</template>

<script>
export default {
    name: "EventsPanel"
}
</script>

<style scoped lang="scss">
    @import './panel.scss';
</style>