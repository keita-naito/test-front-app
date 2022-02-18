import CryptoJS from 'crypto-js'
import createPersistedState from 'vuex-persistedstate'
import Cookies from 'js-cookie'
import cookie from 'cookie'

const COOKIE_TARGET_STORE = ['sessionUser']
const CRYPTO_KEY = '88e3b6e423c0c06aa73e7a65188bdf3229b20f23'

export default ({ store, req, isDev }) => {
  createPersistedState({
    key: '_online-class-v1',
    paths: COOKIE_TARGET_STORE,
    storage: {
      getItem: (key) => {
        const value = process.client
          ? Cookies.get(key)
          : cookie.parse(req.headers.cookie)[key]
        let result
        try {
          const decoded = CryptoJS.AES.decrypt(value, CRYPTO_KEY).toString(
            CryptoJS.enc.Utf8
          )
          result = JSON.parse(decoded)
        } catch {
          result = ''
        }

        return result
      },
      setItem: (key, value) => {
        const convertedValue = JSON.stringify(value)
        const encoded = CryptoJS.AES.encrypt(
          convertedValue,
          CRYPTO_KEY
        ).toString()

        const cookie = Cookies.set(key, encoded, {
          expires: 14, // 14日間有効
          secure: !isDev,
          sameSite: 'lax',
        })
        return cookie
      },
      removeItem: (key) => Cookies.remove(key),
    },
  })(store)
}
