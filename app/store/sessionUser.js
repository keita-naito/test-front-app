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
    const response = await this.$axios.post('/v1/user/auth/sign_in', params)
    const headers = response.headers

    const signInHeaders = {
      'access-token': headers['access-token'],
      client: headers.client,
      uid: headers.uid,
    }

    commit('setHeaders', signInHeaders)
    commit('setSignInState', true)
  },

  async signOut({ commit }) {
    try {
      await this.$axios.delete('/v1/user/auth/sign_out')
    } catch {
      // noop
    } finally {
      commit('resetHeaders')
      commit('setSignInState', false)
    }
  },
}