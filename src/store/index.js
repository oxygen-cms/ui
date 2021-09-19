import Vuex from 'vuex';

import UserPermissions from "../UserPermissions";
import AuthApi from "../AuthApi";
import UserPreferences from "../UserPreferences";

export default (vue) => {
    vue.use(Vuex);

    return new Vuex.Store({
        state: {
            user: null,
            loginStatus: null,
            impersonating: false
        },
        mutations: {
            setUser(state, user) {
                state.user = user;
                state.loginStatus = user !== null;
            },
            setImpersonating(state, user) {
                state.user = user;
                state.loginStatus = user !== null;
                state.impersonating = true;
            },
            stopImpersonating(state, user) {
                state.user = user;
                state.loginStatus = user !== null;
                state.impersonating = false;
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
        },
        actions: {
            determineLoginStatus({ commit, state }) {
                return new Promise((resolve) => {
                    if(state.loginStatus != null) {
                        resolve(state.loginStatus);
                        return;
                    }

                    console.log('Determining login status');

                    let authApi = new AuthApi(null);
                    authApi.login(null, null, null).then((response) => {
                        console.log(response);
                        if(response.impersonating === true) {
                            commit('setImpersonating', response.user);
                        } else {
                            commit('setUser', response.user);
                        }
                        resolve(true);
                    }).catch(() => {
                        commit('setUser', null);
                        resolve(false);
                    })
                });

            }
        }
    });
};
