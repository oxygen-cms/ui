<template>
    <b-field>
        <b-autocomplete
            :value="computedValue"
            :loading="loading || updating"
            open-on-focus
            field="name"
            :data="users"
            placeholder="Select a group..."
            clearable
            @typing="fetchData"
            @select="o => $emit('select', o)">
            <template #empty>No results found</template>
            <template slot-scope="props">
                <p><b-icon :icon="props.option.icon"></b-icon><strong>{{ props.option.name }}</strong></p>
                <p class="is-size-7" style="white-space: break-spaces;">{{ props.option.description }}</p>
            </template>
        </b-autocomplete>
    </b-field>
</template>

<script>
import GroupsApi from "../GroupsApi";

export default {
    name: "GroupsChooser",
    props: {
        value: { required: true },
        updating: { type: Boolean, default: false }
    },
    data() {
        return {
            groupsApi: new GroupsApi(this.$buefy),
            loading: true,
            users: []
        }
    },
    computed: {
        computedValue() {
            return this.value ? this.value.name : '';
        }
    },
    async mounted() {
        await this.fetchData('');
    },
    methods: {
        async fetchData(name) {
            this.loading = true;
            this.users = (await this.groupsApi.list(false, 1, name)).items;
            this.loading = false;
        }
    }
}
</script>

<style scoped>

</style>