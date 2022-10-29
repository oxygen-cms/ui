<template>
    <div class="full-height scroll-container pad">
        <div class="box">
            <div class="level">
                <div class="level-left">
                    <h1 class="title">Users</h1>
                </div>
                <div class="level-right">
                    <b-input v-model="searchQuery" icon-left="search" rounded placeholder="Search for users..." class="mr-4"></b-input>
                    <b-button type="is-success" icon-left="plus" @click="isCreateUserModalActive = true">Create Account</b-button>
                </div>
            </div>

            <b-table :data="paginatedItems.items === null ? [] : paginatedItems.items" :loading="paginatedItems.loading">
                <b-table-column v-slot="props" label="Full Name">
                    <GenericEditableField :api="usersApi" :data="props.row" field-name="fullName" @update:data="updateUser">
                        <template #display="{ value, edit }">
                            <p>
                                {{ value }}
                                <EditButtonOnRowHover :edit="edit" />
                            </p>
                        </template>
                    </GenericEditableField>
                </b-table-column>
                <b-table-column v-slot="props" label="Email">
                    <GenericEditableField :api="usersApi" :data="props.row" field-name="email" type="email" @update:data="updateUser">
                        <template #display="{ value, edit }">
                            <p>
                                <a :href="'mailto:' + value" target="_blank" class="is-size-7">{{ value }}</a>
                                <EditButtonOnRowHover :edit="edit" />
                            </p>
                        </template>
                    </GenericEditableField>
                </b-table-column>
                <b-table-column v-slot="props" label="Group">
                    <GenericEditableField :api="usersApi" :data="props.row" field-name="group" @update:data="updateUser">
                        <template #display="{ value, edit }">
                            <p>
                                {{ value.name }}
                                <EditButtonOnRowHover :edit="edit" />
                            </p>
                        </template>
                        <template #edit="{ initialValue, submit, updating }">
                            <GroupsChooser :value="initialValue" :updating="updating" @select="submit" />
                        </template>
                    </GenericEditableField>
                </b-table-column>
                <b-table-column v-slot="props" label="Username">
                    <GenericEditableField :api="usersApi" :data="props.row" field-name="username" @update:data="updateUser">
                        <template #display="{ value, edit }">
                            <p>
                                {{ value }}
                                <EditButtonOnRowHover :edit="edit" />
                            </p>
                        </template>
                    </GenericEditableField>
                </b-table-column>
                <b-table-column v-slot="props" label="Email Verified">
                    {{ props.row.emailVerified ? 'Yes' : 'No' }}
                </b-table-column>
                <b-table-column v-slot="props" label="Two-Factor Auth">
                    {{ props.row.twoFactorAuthEnabled ? 'Yes' : 'No' }}
                </b-table-column>
                <b-table-column v-slot="props" label="Joined">
                    <UserJoined :user="props.row"></UserJoined>
                </b-table-column>
                <b-table-column v-slot="props" label="" width="25em">
                    <div class="buttons">
                        <b-button rounded icon-left="sign-in-alt" size="is-small" type="is-info" @click="impersonate(props.row.id)">Login as this user</b-button>
                        <b-button v-if="props.row.deletedAt" rounded icon-left="trash" size="is-small" type="is-danger" @click="forceDelete(props.row.id)">Delete Forever</b-button>
                        <b-button v-if="!props.row.deletedAt" rounded icon-left="minus-circle" size="is-small" @click="deactivate(props.row.id)">Deactivate</b-button>
                        <b-button v-else rounded icon-left="plus" size="is-small" type="is-success" @click="activate(props.row.id)">Activate</b-button>
                    </div>
                </b-table-column>
            </b-table>

            <CreateUserModal :active.sync="isCreateUserModalActive" @update:users="fetchData" />
        </div>

        <GroupsList @updated="fetchData" />
    </div>
</template>

<script>
import UsersApi from "../UsersApi";
import UserJoined from "./UserJoined.vue";
import {morphToNotification} from "../api";
import VueRouter from 'vue-router';
const { isNavigationFailure, NavigationFailureType } = VueRouter;
import GenericEditableField from "./GenericEditableField.vue";
import GroupsChooser from "./GroupsChooser.vue";
import GroupsList from "./GroupsList.vue";
import EditButtonOnRowHover from "./EditButtonOnRowHover.vue";
import CreateUserModal from "./users/CreateUserModal.vue";

export default {
    name: "UserManagement",
    components: {
        CreateUserModal,
        EditButtonOnRowHover, GroupsChooser, GenericEditableField, UserJoined, GroupsList},
    data() {
        return {
            usersApi: new UsersApi(this.$buefy),
            selectedUser: null,
            searchQuery: null,
            isCreateUserModalActive: false,
            paginatedItems: {items: null, totalItems: null, itemsPerPage: null, loading: false, currentPage: 1},
        }
    },
    watch: {
        'searchQuery': 'fetchData'
    },
    created() {
        this.fetchData()
    },
    methods: {
        async fetchData() {
            this.paginatedItems.loading = true;
            let data = await this.usersApi.list(false, this.paginatedItems.currentPage, this.searchQuery);

            this.paginatedItems.items = data.items;
            this.paginatedItems.totalItems = data.totalItems;
            this.paginatedItems.itemsPerPage = data.itemsPerPage;
            this.paginatedItems.loading = false;
        },
        async impersonate(id) {
            const promise = new Promise((resolve) => {
                this.$buefy.dialog.confirm({
                    message: 'This super-admin functionality allows you to impersonate another user. Are you sure you want to continue?',
                    onConfirm: resolve
                });
            });

            await promise;
            let response = await this.usersApi.impersonate(id);
            console.log(response);
            this.$buefy.notification.open(morphToNotification(response));
            this.$store.commit('setImpersonating', response.user);
            // ignore duplicated navigation failure
            await this.$router.push({ path: '/' }).catch(failure => {
                if(!isNavigationFailure(failure, NavigationFailureType.duplicated)) {
                    throw failure;
                }
            });
        },
        async deactivate(id) {
            await this.usersApi.deleteAndNotify(id);
            await this.fetchData();
        },
        async activate(id) {
            await this.usersApi.restoreAndNotify(id);
            await this.fetchData();
        },
        async forceDelete(id) {
            await this.usersApi.confirmForceDelete(id);
            await this.fetchData();
        },
        updateUser(user) {
            this.paginatedItems.items = this.paginatedItems.items.map(u => {
                return u.id === user.id ? user : u;
            })
        }
    }
}
</script>

<style scoped>
    @import './util.css';
</style>
