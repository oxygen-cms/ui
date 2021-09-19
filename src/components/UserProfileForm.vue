<template>
    <div>
        <div class="media">
            <div class="media-left has-background-grey-light centered-icon">
                <b-icon icon="user" size="is-large" class="has-text-grey-lighter"></b-icon>
            </div>
            <div class="media-content">
                <GenericEditableField :api="usersApi" :data="user" label="Full Name" field-name="fullName" @update:data="user => $emit('update:user', user)">
                    <template #display="{ value, edit }">
                        <p class="title is-4">
                            {{ value }} <b-button rounded size="is-small" type="is-light" icon-left="pencil-alt" @click="edit"></b-button>
                        </p>
                    </template>
                </GenericEditableField>
                <p class="subtitle is-6">
                    {{ user.email }}
                    <b-tooltip label="To change email addresses, please contact your administrator." position="is-right" multilined><b-icon icon="info-circle"></b-icon></b-tooltip>
                </p>
            </div>
        </div>

        <div class="content">
            <div class="level level-left">
                <strong class="mr-2">Username:</strong>
                <span>{{ user.username }}
                    <b-tooltip label="To change username, please contact your administrator." position="is-right" multilined><b-icon icon="info-circle"></b-icon></b-tooltip>
                </span>
            </div>
            <div class="level level-left"><strong class="mr-2">Group: </strong>
                <transition name="fade" mode="out-in">
                        <span v-if="user">{{ user.group.name }}
                            <b-tooltip :label="user.group.description" position="is-right" multilined><b-icon icon="info-circle"></b-icon></b-tooltip>
                        </span>
                    <b-skeleton v-else width="20%" :animated="true" />
                </transition>
            </div>
            <div class="level level-left"><strong class="mr-2">Joined: </strong>
                <transition name="fade" mode="out-in">
                    <UserJoined v-if="user" :user="user" />
                    <b-skeleton v-else width="20%" :animated="true" />
                </transition>
            </div>
        </div>

        <b-modal :closable="false" :active.sync="isUserPreferencesModalActive" has-modal-card trap-focus aria-role="dialog" aria-modal>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title"><b-icon icon="cogs" size="is-normal" class="push-right"></b-icon>User Preferences</p>
                </header>
                <section class="modal-card-body">
                    <UserPreferences />
                </section>
            </div>
        </b-modal>

        <b-button v-if="admin" @click="isUserPreferencesModalActive = true">Open User Preferences...</b-button>

        <ShowIfPermitted v-if="!admin" :keys="['user.general', 'user.editor']">
            <b-notification :closable="false" class="bottom-margin">
                <h2 class="subtitle">User Preferences</h2>
                <p>You can modify and personalize certain aspects of this administration interface to suit your own preferences.</p>
                <br />
                <b-button @click="isUserPreferencesModalActive = true">Open User Preferences...</b-button>
            </b-notification>
        </ShowIfPermitted>

        <b-notification v-if="!admin" :closable="false">
            <h2 class="subtitle">Change Password</h2>
            <p>
                Choosing a strong password will help keep your account safe.<br>
                Try to use as many different characters, numbers and symbols as you possibly can, and make sure you don't use the password anywhere else.
            </p>
            <br>
            <b-button type="is-info is-link" @click="isChangePasswordModalActive = true">Change your password now.</b-button>
        </b-notification>

        <b-notification v-if="!admin" :closable="false">
            <h2 class="subtitle">Terminate Account</h2>
            <p>If you are sure you delete <strong>your entire account and everything associated with it</strong>, then click the button below.</p>
            <br>
            <b-button type="is-danger" @click="deleteAccount">Delete your account</b-button>
        </b-notification>

        <b-modal
            :active.sync="isChangePasswordModalActive"
            has-modal-card
            trap-focus
            :destroy-on-hide="false"
            aria-role="dialog"
            aria-modal>
            <template #default>
                <div class="modal-card" style="width: 30em;">
                    <header class="modal-card-head">
                        <p class="modal-card-title">Change Password</p>
                    </header>
                    <section class="modal-card-body">
                        <b-field label="Old password" label-position="inside">
                            <b-input
                                v-model="oldPassword"
                                type="password"
                                password-reveal
                                placeholder="Old password"
                                required>
                            </b-input>
                        </b-field>
                        <b-field label="New password" label-position="inside">
                            <b-input
                                v-model="newPassword"
                                type="password"
                                password-reveal
                                placeholder="New password"
                                required>
                            </b-input>
                        </b-field>

                        <b-field label="New password again" label-position="inside">
                            <b-input
                                v-model="newPasswordAgain"
                                type="password"
                                password-reveal
                                placeholder="New password again"
                                required
                                @keyup.enter.native="changePassword">
                            </b-input>
                        </b-field>
                    </section>
                    <footer class="modal-card-foot" style="justify-content: flex-end;">
                        <b-button @click="isChangePasswordModalActive = false;">Close</b-button>
                        <b-button tag="input" native-type="submit" class="button is-primary" value="Change Password" @click="changePassword" />
                    </footer>
                </div>
            </template>
        </b-modal>
    </div>
</template>

<script>
import {morphToNotification} from "../api";
import UserJoined from "./UserJoined.vue";
import ShowIfPermitted from "./preferences/ShowIfPermitted.vue";
import UserPreferences from "./preferences/UserPreferences.vue";
import UsersApi from "../UsersApi";
import AuthApi from "../AuthApi";
import GenericEditableField from "./GenericEditableField.vue";

export default {
    name: "UserProfileForm",
    components: {GenericEditableField, ShowIfPermitted, UserJoined, UserPreferences },
    props: {
        user: {
            type: Object,
            required: true
        },
        admin: {
            type: Boolean,
            default: false
        }
    },
    emits: 'update:user',
    data() {
        return {
            oldPassword: '',
            newPassword: '',
            newPasswordAgain: '',
            isChangePasswordModalActive: false,
            isUserPreferencesModalActive: false,
            authApi: new AuthApi(this.$buefy),
            usersApi: new UsersApi(this.$buefy)
        }
    },
    methods: {
        async changePassword() {
            let response = await this.authApi.changePassword(this.oldPassword, this.newPassword, this.newPasswordAgain);
            this.$buefy.toast.open(morphToNotification(response));
            if(response.status === 'success') {
                this.oldPassword = '';
                this.newPassword = '';
                this.newPasswordAgain = '';
                this.isChangePasswordModalActive = false;
            }
        },
        deleteAccount() {
            this.$buefy.dialog.confirm({
                title: 'Deleting account',
                message: 'Are you sure you want to <b>delete</b> your account? This action may not be reversible.',
                type: 'is-danger',
                hasIcon: true,
                onConfirm: async () => {
                    await this.usersApi.delete(this.user.id);
                    await this.authApi.logout();
                    this.$store.commit('setUser', null);
                    await this.$router.push('/auth/logout');
                }
            })
        }
    }
}
</script>

<style scoped>
@import './util.css';

.centered-icon {
    width: 3.5em; height: 3.5em; display: flex; justify-content: center; align-items: center;
}

.bottom-margin {
    margin-bottom: 1.5rem;
}

.push-right {
    margin-right: 1rem;
}
</style>
