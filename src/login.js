import Vue from "vue";
import Buefy from "buefy";
import './styles/app.scss';
import './styles/login.scss';
import {morphToNotification} from "./api";

Vue.use(Buefy, {
    defaultIconComponent: 'vue-fontawesome',
    defaultIconPack: 'fas',
});

var app = new Vue({
}).$mount('#app');

if(typeof window.OXYGEN_SESSION_NOTIFICATION !== 'undefined') {
    app.$buefy.toast.open(morphToNotification(window.OXYGEN_SESSION_NOTIFICATION));
}
