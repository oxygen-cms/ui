<template>
    <b-button
        type="is-text"
        :icon-right="icon"
        class="minimal-button">
    </b-button>
</template>

<script>
export default {
    name: "MinimalDropdownButton",
    props: {
        icon: {
            type: String,
            required: true
        }
    }
}
</script>

<style scoped lang="scss">
    @import '../styles/variables.scss';

    .minimal-button {
        padding: 0 0.5em;
        height: auto;
    }

    .button.is-text.minimal-button {
        background-color: $grey-lighter;
    }

    .button.is-text.minimal-button:hover {
        background-color: darken($grey-lighter, 5%);
    }
</style>
