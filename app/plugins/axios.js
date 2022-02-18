export default function setup({ store }) {
  store.$axios.interceptors.request.use((config) => {
    const headers = store.state.sessionUser.headers
    for (const key in headers) {
      const value = headers[key]
      config.headers[key] = value
    }
    return config
  })

  store.$axios.onError((error) => {
    // 認証エラーの場合、ログアウト
    if (error.response.status === 401) {
      store.dispatch('sessionUser/signOutOnScreen')
    }
  })
}
