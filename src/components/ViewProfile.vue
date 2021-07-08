<template>
    <div class="full-height scroll-container pad">
        <div class="card">
            <div class="card-content">
                <div class="media">
                    <div class="media-left has-background-grey-light centered-icon">
                        <b-icon icon="user" size="is-large" class="has-text-grey-lighter"></b-icon>
                    </div>
                    <div class="media-content">
                        <transition name="fade" mode="out-in">
                            <p class="title is-4" v-if="user && editingFullName === null">{{ user.fullName }} <b-button rounded size="is-small" type="is-light" icon-left="pencil-alt" @click="editFullName"></b-button></p>
                            <b-field v-else-if="user" label="Full Name" label-position="inside" class="not-full-width">
                                <b-input v-model="editingFullName"></b-input>
                                <p class="control">
                                    <b-button type="is-primary" :loading="updatingFullName" @click="submitFullName">Change</b-button>
                                </p>
                            </b-field>
                            <b-skeleton size="is-medium" width="40%" :animated="true" v-else></b-skeleton>
                        </transition>
                        <transition name="fade" mode="out-in">
                            <p class="subtitle is-6" v-if="user">
                                {{ user.email }}
                                <b-tooltip label="To change email addresses, please contact your administrator." position="is-right" multilined><b-icon icon="info-circle"></b-icon></b-tooltip>
                            </p>
                            <b-skeleton width="30%" :animated="true" v-else></b-skeleton>
                        </transition>
                    </div>
                </div>

                <div class="content">
                    <div class="level level-left">
                        <strong class="mr-2">Username:</strong>
                        <transition name="fade" mode="out-in">
                            <span v-if="user">{{ user.username }}
                                <b-tooltip label="To change username, please contact your administrator." position="is-right" multilined><b-icon icon="info-circle"></b-icon></b-tooltip>
                            </span>
                            <b-skeleton width="20%" :animated="true" v-else />
                        </transition>
                    </div>
                    <div class="level level-left"><strong class="mr-2">Group: </strong>
                    <transition name="fade" mode="out-in">
                    <span v-if="user">{{ user.group.name }}
                        <b-tooltip :label="user.group.description" position="is-right" multilined><b-icon icon="info-circle"></b-icon></b-tooltip>
                    </span>
                    <b-skeleton width="20%" :animated="true" v-else />
                    </transition>
                    </div>
                    <div class="level level-left"><strong class="mr-2">Joined: </strong>
                        <transition name="fade" mode="out-in">
                            <span v-if="user">{{ joined }}, on {{ joinedAbs }}</span>
                            <b-skeleton width="20%" :animated="true" v-else />
                        </transition>
                    </div>
                </div>

                <ShowIfPermitted :keys="['user.general', 'user.editor']">
                    <b-modal :closable="false" :active.sync="isUserPreferencesModalActive" has-modal-card trap-focus aria-role="dialog" aria-modal>
                        <div class="modal-card">
                            <header class="modal-card-head">
                                <p class="modal-card-title"><b-icon icon="cogs" size="is-normal" class="push-right"></b-icon>User Preferences</p>
                            </header>
                            <section class="modal-card-body">
                                <UserPreferences></UserPreferences>
                            </section>
                        </div>
                    </b-modal>
                    <b-notification :closable="false" class="bottom-margin">
                        <h2 class="subtitle">User Preferences</h2>
                        <p>You can modify and personalize certain aspects of this administration interface to suit your own preferences.</p>
                        <br />
                        <b-button @click="isUserPreferencesModalActive = true">Open User Preferences...</b-button>
                    </b-notification>
                </ShowIfPermitted>

                <b-notification :closable="false">
                    <h2 class="subtitle">Change Password</h2>
                    <p>
                        Choosing a strong password will help keep your account safe.<br>
                        Try to use as many different characters, numbers and symbols as you possibly can, and make sure you don't use the password anywhere else.
                    </p>
                    <br>
                    <b-button @click="isChangePasswordModalActive = true" type="is-info is-link">Change your password now.</b-button>
                </b-notification>

                <b-notification :closable="false">
                    <h2 class="subtitle">Terminate Account</h2>
                    <p>If you are sure you delete <strong>your entire account and everything associated with it</strong>, then click the button below.</p>
                    <br>
                    <b-button type="is-danger" @click="deleteAccount">Permanently delete your account</b-button>
                </b-notification>
            </div>
        </div>

        <b-modal
            :active.sync="isChangePasswordModalActive"
            has-modal-card
            trap-focus
            :destroy-on-hide="false"
            aria-role="dialog"
            aria-modal>
            <template #default="props">
                <div class="modal-card" style="width: 30em;">
                    <header class="modal-card-head">
                        <p class="modal-card-title">Change Password</p>
                    </header>
                    <section class="modal-card-body">
                        <b-field label="Old password" label-position="inside">
                            <b-input
                                type="password"
                                v-model="oldPassword"
                                password-reveal
                                placeholder="Old password"
                                required>
                            </b-input>
                        </b-field>
                        <b-field label="New password" label-position="inside">
                            <b-input
                                type="password"
                                v-model="newPassword"
                                password-reveal
                                placeholder="New password"
                                required>
                            </b-input>
                        </b-field>

                        <b-field label="New password again" label-position="inside">
                            <b-input
                                type="password"
                                v-model="newPasswordAgain"
                                password-reveal
                                placeholder="New password again"
                                required>
                            </b-input>
                        </b-field>
                    </section>
                    <footer class="modal-card-foot" style="justify-content: flex-end;">
                        <b-button @click="isChangePasswordModalActive = false;">Close</b-button>
                        <b-button tag="input" native-type="submit" class="button is-primary" @click="changePassword" value="Change Password" />
                    </footer>
                </div>
            </template>
        </b-modal>
    </div>
</template>

<script>
import AuthApi from "../AuthApi";
import Internationalize from "../Internationalize";
import {morphToNotification} from "../api";
import UserPreferences from "./preferences/UserPreferences.vue";
import ShowIfPermitted from "./preferences/ShowIfPermitted.vue";

export default {
    name: "ViewProfile",
    components: {ShowIfPermitted, UserPreferences},
    data() {
        return {
            user: null,
            editingFullName: null,
            updatingFullName: false,
            oldPassword: '',
            newPassword: '',
            newPasswordAgain: '',
            isChangePasswordModalActive: false,
            isUserPreferencesModalActive: false,
            authApi: new AuthApi(this.$buefy)
        }
    },
    created() {
        this.fetchUserDetails()
    },
    computed: {
        joined() {
            const rtf1 = new Intl.RelativeTimeFormat('en', { style: 'narrow' });
            return rtf1.format(
                Math.floor((new Date(this.user.createdAt) - new Date()) / (1000 * 24 * 60 * 60)),
                'day'
        );
        },
        joinedAbs() {
            return Internationalize.formatDate(this.user.createdAt);
        }
    },
    methods: {
        async fetchUserDetails() {
            this.user = (await this.authApi.userDetails()).user;
        },
        editFullName() {
            this.editingFullName = this.user.fullName;
        },
        async submitFullName() {
            this.updatingFullName = true;
            let response = await this.authApi.updateFullName(this.editingFullName);
            this.updatingFullName = false;
            this.$buefy.toast.open(morphToNotification(response));
            this.user = response.item;
            this.editingFullName = null;
        },
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
                message: 'Are you sure you want to <b>delete</b> your account? This action cannot be undone.',
                type: 'is-danger',
                hasIcon: true,
                onConfirm: async () => {
                    let response = await this.authApi.terminateAccount();
                    window.location = '/';
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

    .not-full-width {
        width: 20rem;
    }

    .bottom-margin {
        margin-bottom: 1.5rem;
    }

    .push-right {
        margin-right: 1rem;
    }
</style>
