<template>
    <div class="box">
        <div class="level">
            <div class="level-left">
                <h1 class="title">Groups</h1>
            </div>
            <div class="level-right">
            </div>
        </div>

        <b-table :data="paginatedItems.items === null ? [] : paginatedItems.items" :loading="paginatedItems.loading">
            <b-table-column label="" v-slot="props">
                <GenericEditableField :api="groupsApi" :data="props.row" @update:data="updateGroup" field-name="icon">
                    <template #display="{ value, edit }">
                        <b-icon :icon="value" size="is-small"></b-icon>
                        <EditButtonOnRowHover :edit="edit" />
                    </template>
                </GenericEditableField>
            </b-table-column>
            <b-table-column label="Name" v-slot="props">
                <GenericEditableField :api="groupsApi" :data="props.row" @update:data="updateGroup" field-name="name" />
            </b-table-column>
            <b-table-column label="Description" v-slot="props">
                <GenericEditableField :api="groupsApi" :data="props.row" @update:data="updateGroup" field-name="description" />
            </b-table-column>
            <b-table-column label="Nickname" v-slot="props">
                <GenericEditableField :api="groupsApi" :data="props.row" @update:data="updateGroup" field-name="nickname">
                    <template #display="{ value, edit }">
                        <code>{{ value }}</code>
                        <EditButtonOnRowHover :edit="edit" />
                    </template>
                </GenericEditableField>
            </b-table-column>
            <b-table-column label="Created" v-slot="props">
                <UserJoined :user="props.row"></UserJoined>
            </b-table-column>
            <b-table-column label="" v-slot="props" width="25em">
                <div class="buttons">
                    <b-button rounded outlined icon-left="recycle" v-if="props.row.deletedAt" @click="restoreItem(props.row.id)" size="is-small">Restore</b-button>
                    <b-button rounded type="is-danger" outlined icon-left="trash" v-if="props.row.deletedAt" @click="forceDeleteItem(props.row.id)" size="is-small">Delete Forever</b-button>
                    <b-button rounded icon-left="trash" v-if="!props.row.deletedAt"  @click="deleteItem(props.row.id)" size="is-small">Delete</b-button>
                </div>
            </b-table-column>
        </b-table>

        <hr />

        <div class="content">
            <h3>Permissions</h3>
            <p>To edit group permissions, you will need access to the <code>artisan</code> console command which comes installed with this application.</p>
            <p>Here are some getting-started tips:</p>
            <pre><code>
# list all permissions recognised the application
artisan permissions

# list permissions explictly set for the "admin" group
artisan permissions admin

# list all permissions for the "admin" group
artisan permissions admin -a

# grant a permission to group "admin"
artisan permissions admin --grant pages.postCreate

# unset a permission for group "admin"
artisan permissions admin --unset pages.postCreate

# explicitly deny a permission for group "admin"
artisan permissions admin --deny pages.postCreate

# sets that "pages" should inherit their permissions from "_content"
artisan permissions admin --inherit pages:_content</code></pre>
        </div>

    </div>
</template>

<script>
import UsersApi from "../UsersApi";
import GroupsApi from "../GroupsApi";
import UserJoined from "./UserJoined.vue";
import GenericEditableField from "./GenericEditableField.vue";
import EditButtonOnRowHover from "./EditButtonOnRowHover.vue";

export default {
    name: "GroupsList",
    data() {
        return {
            groupsApi: new GroupsApi(this.$buefy),
            paginatedItems: {items: null, totalItems: null, itemsPerPage: null, loading: false, currentPage: 1},
        }
    },
    components: { UserJoined, GenericEditableField, EditButtonOnRowHover },
    async mounted() {
        this.fetchData()
    },
    methods: {
        async fetchData() {
            this.paginatedItems.loading = true;
            let data = await this.groupsApi.list(false, this.paginatedItems.currentPage, null);
            this.paginatedItems.items = data.items;
            this.paginatedItems.totalItems = data.totalItems;
            this.paginatedItems.itemsPerPage = data.itemsPerPage;
            this.paginatedItems.loading = false;
        },
        updateGroup(group) {
            this.paginatedItems.items = this.paginatedItems.items.map(g => {
                return g.id === group.id ? group : g;
            });
            this.$emit('updated');
        },
        async deleteItem(id) {
            await this.groupsApi.deleteAndNotify(id);
            await this.fetchData();
        },
        async forceDeleteItem(id) {
            await this.groupsApi.confirmForceDelete(id);
            await this.fetchData();
        },
        async restoreItem(id) {
            await this.groupsApi.restoreAndNotify(id);
            await this.fetchData();
        }
    }
}
</script>

<style scoped>

</style>