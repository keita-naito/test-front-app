import camelcaseKeys from 'camelcase-keys'

export const state = () => ({
  articles: {},
})

export const getters = {
  articles: (state) => state.articles,
}

export const mutations = {
  setArticles(state, articles) {
    state.articles = articles
  },
}

export const actions = {
  async fetchArticles({ commit }) {
    const response = await this.$axios.get(`/articles`)

    const data = camelcaseKeys(response.data?.data, { deep: true })
    commit('setArticles', data)
  },
}
