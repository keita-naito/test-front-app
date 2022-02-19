export const state = () => ({
  isSignedIn: false,
  headers: {},
})

export const getters = {}

export const mutations = {
  setHeaders(state, headers) {
    state.headers = headers
  },
  setSignInState(state, isSignedIn) {
    state.isSignedIn = isSignedIn
  },
  resetHeaders(state) {
    state.headers = {}
  },
}

export const actions = {
  async signIn({ commit }, params) {
    const response = await this.$axios.post('/auth/sign_in', params)
    const headers = response.headers

    const signInHeaders = {
      'access-token': headers['access-token'],
      client: headers.client,
      uid: headers.uid,
    }

    commit('setHeaders', signInHeaders)
    commit('setSignInState', true)
  },

  signOut({ commit }) {
    commit('resetHeaders')
    commit('setSignInState', false)
  },

  signOutOnScreen({ commit }) {
    commit('resetHeaders')
    commit('setSignInState', false)
  },
}
