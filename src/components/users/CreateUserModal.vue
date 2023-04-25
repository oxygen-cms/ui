<template>
    <b-modal :closable="false" :active="active" has-modal-card trap-focus aria-role="dialog" aria-modal @update:active="a => $emit('update:active', a)">
        <div class="modal-card" style="overflow: visible">
            <header class="modal-card-head">
                <p class="modal-card-title">
                    <b-icon icon="users" size="is-normal" class="push-right"></b-icon>
                    Create Account
                </p>
            </header>
            <section class="modal-card-body" style="overflow: visible">
                <b-field label="Username">
                    <b-input v-model="username" placeholder="e.g.: johndoe"></b-input>
                </b-field>
                <b-field label="Email Address">
                    <b-input v-model="email" type="email" placeholder="e.g.: example@example.com"></b-input>
                </b-field>
                <b-field label="Full Name">
                    <b-input v-model="fullName" placeholder="e.g.: John Doe"></b-input>
                </b-field>
                <b-field label="Group">
                    <GroupsChooser :value="group" @select="g => group = g" />
                </b-field>
            </section>
            <footer class="modal-card-foot is-flex">
                <div class="is-flex-grow-1"></div>
                <b-button @click="$emit('update:active', false)">Cancel</b-button>
                <b-button type="is-primary" :loading="submitting" @click="submit">Create Account</b-button>
            </footer>
        </div>
    </b-modal>
</template>

<script>
import GroupsChooser from "../GroupsChooser.vue";
import UsersApi from "../../UsersApi";
import {morphToNotification} from "../../api";
export default {
    name: "CreateUserModal",
    components: {GroupsChooser},
    props: {
        active: { type: Boolean, required: true }
    },
    data() {
        return {
            username: '',
            email: '',
            fullName: '',
            group: null,
            submitting: false,
            usersApi: new UsersApi()
        }
    },
    methods: {
        async submit() {
            let data = { username: this.username, email: this.email, fullName: this.fullName, group: this.group };
            try {
                this.submitting = true;
                let response = await this.usersApi.create(data);
                this.$buefy.notification.open(morphToNotification(response));
                this.$emit('update:active', false);
                this.$emit('update:users');
            } catch(e) {
                // let the user try again
            }
            this.submitting = false;
        }
    }
}
</script>

<style scoped>

</style>