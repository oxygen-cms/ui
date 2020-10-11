<template>
    <div class="full-height-container">
        <transition name="fade">
            <div v-if="!user" key="load-screen">
                <b-skeleton width="20%" :animated="true"></b-skeleton>
                <b-skeleton width="40%" :animated="true"></b-skeleton>
                <b-skeleton width="80%" :animated="true"></b-skeleton>
                <b-skeleton :animated="true"></b-skeleton>
            </div>
            <div v-else key="resolved" class="card">
                <div class="card">
                    <div class="card-content">
                        <div class="media">
                            <div class="media-content">
                                <p class="title is-4">{{ user.fullName }}</p>
                                <p class="subtitle is-6">{{ user.email }}</p>
                            </div>
                        </div>

                        <div class="content">
                            <p><strong>Username:</strong> {{ user.username }}</p>
                            <p><strong>Group:</strong> {{ user.group.name }}</p>
                            <p><strong>Joined:</strong> {{ joined }}, on {{ joinedAbs }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </transition>

        <div class="box" style="margin-top: 2em;">
            <h2 class="subtitle">Change Password</h2>
            <p>
                Choosing a strong password will help keep your account safe.<br>
                Try to use as many different characters, numbers and symbols as you possibly can, and make sure you don't use the password anywhere else.
            </p>
            <br>
            <b-button @click="isChangePasswordModalActive = true" type="is-info is-link">Change your password now.</b-button>
        </div>

        <div class="box">
            <h2 class="subtitle">Terminate Account</h2>
            <p>If you are sure you delete <strong>your entire account and everything associated with it</strong>, then click the button below.</p>
            <br>
            <b-button type="is-danger" @click="deleteAccount">Permanently delete your account</b-button>
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
                                :value="oldPassword"
                                password-reveal
                                placeholder="Old password"
                                required>
                            </b-input>
                        </b-field>

                        <b-field label="New password">
                            <b-input
                                type="password"
                                :value="newPassword"
                                password-reveal
                                placeholder="New password"
                                required>
                            </b-input>
                        </b-field>

                        <b-field label="New password again">
                            <b-input
                                type="password"
                                :value="newPasswordAgain"
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
            isChangePasswordModalActive: false
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
        fetchUserDetails() {
            AuthApi.userDetails((data) => {
                this.user = data.user;
            })
        },
        changePassword() {
            AuthApi.changePassword(this.oldPassword, this.newPassword, this.newPasswordAgain, (response) => {
                this.$buefy.toast.open(morphToNotification(response));
            });
        },
        deleteAccount() {
            this.$buefy.dialog.confirm({
                title: 'Deleting account',
                message: 'Are you sure you want to <b>delete</b> your account? This action cannot be undone.',
                type: 'is-danger',
                hasIcon: true,
                onConfirm: () => {
                    alert('will delete');
                }
            })
        }
    }
}
</script>

<style scoped>
    @import './util.css';
</style>
