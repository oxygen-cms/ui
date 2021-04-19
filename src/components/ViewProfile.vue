<template>
    <div class="full-height scroll-container pad">
        <div class="card">
            <div class="card-content">
                <div class="media">
                    <div class="media-left has-background-grey-lighter centered-icon">
                        <b-icon icon="user" size="is-large"></b-icon>
                    </div>
                    <div class="media-content">
                        <transition name="fade-out-in">
                            <p class="title is-4" v-if="user">{{ user.fullName }}</p>
                            <b-skeleton size="is-medium" width="40%" :animated="true" v-else></b-skeleton>
                        </transition>
                        <transition name="fade-out-in">
                            <p class="subtitle is-6" v-if="user">{{ user.email }}</p>
                            <b-skeleton width="30%" :animated="true" v-else></b-skeleton>
                        </transition>
                    </div>
                </div>

                <div class="content">
                    <div class="level level-left">
                        <strong class="mr-2">Username:</strong>
                        <transition name="fade-out-in">
                            <span v-if="user">{{ user.username }}</span>
                            <b-skeleton width="20%" :animated="true" v-else />
                        </transition>
                    </div>
                    <div class="level level-left"><strong class="mr-2">Group: </strong>
                    <transition name="fade-out-in">
                    <span v-if="user">{{ user.group.name }}</span>
                    <b-skeleton width="20%" :animated="true" v-else />
                    </transition>
                    </div>
                    <div class="level level-left"><strong class="mr-2">Joined: </strong>
                        <transition name="fade-out-in">
                            <span v-if="user">{{ joined }}, on {{ joinedAbs }}</span>
                            <b-skeleton width="20%" :animated="true" v-else />
                        </transition>
                    </div>
                </div>

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
                        <button
                            type="button"
                            class="delete"
                            @click="isChangePasswordModalActive = false"/>
                    </header>
                    <section class="modal-card-body">
                        <b-field label="Old password">
                            <b-input
                                type="password"
                                v-model="oldPassword"
                                password-reveal
                                placeholder="Old password"
                                required>
                            </b-input>
                        </b-field>
                        <b-field label="New password">
                            <b-input
                                type="password"
                                v-model="newPassword"
                                password-reveal
                                placeholder="New password"
                                required>
                            </b-input>
                        </b-field>

                        <b-field label="New password again">
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

export default {
    name: "ViewProfile",
    data() {
        return {
            user: null,
            oldPassword: '',
            newPassword: '',
            newPasswordAgain: '',
            isChangePasswordModalActive: false,
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
</style>
