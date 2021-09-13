import Vuex from 'vuex';

import UserPermissions from "../UserPermissions";
import AuthApi from "../AuthApi";
import UserPreferences from "../UserPreferences";

export default (vue) => {
    vue.use(Vuex);

    return new Vuex.Store({
        state: {
            user: null,
            loginStatus: null
        },
        mutations: {
            setUser(state, user) {
                state.user = user;
                state.loginStatus = user !== null;
            }
        },
        getters: {
            userPermissions: state => {
                if(!state.user) { return null; }
                return new UserPermissions(state.user.permissions);
            },
            userPreferences: state => {
                if(!state.user) { return null; }
                return new UserPreferences(state.user.preferences);
            }
            // isLoggedIn: state => {
            //     if(!state.attemptedSessionLogin) {
            //         return 'unknown';
            //     }
            //     return state.user !== null;
            // }
        },
        actions: {
            determineLoginStatus({ commit, state }) {
                return new Promise((resolve, reject) => {
                    if(state.loginStatus !== null) {
                        resolve(state.loginStatus);
                    }

                    let authApi = new AuthApi(null);
                    authApi.login(null, null, null).then((response) => {
                        console.log(response);
                        commit('setUser', response.user);
                        resolve(true);
                    }).catch(e => {
                        commit('setUser', null);
                        resolve(false);
                    })
                });

            }
        }
    });
};
