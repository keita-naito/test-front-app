import { NuxtConfig } from '@nuxt/types'

const { resolve } = require('path')
require('dotenv').config({ path: resolve(__dirname, './app/.env') })

const { BASE_URL, BASE_API_URL } = process.env

const config: NuxtConfig = {
  ssr: true,
  srcDir: 'app',
  env: {
    baseUrl: BASE_URL || 'http://localhost:8082',
    baseApiUrl: BASE_API_URL || 'http://localhost:3000',
  },
  head: {
    titleTemplate: '%s - online-class-frontend-user',
    title: 'online-class-frontend-user',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    { src: '~/plugins/vuetify.js', mode: 'client' },
    '~/plugins/cookie-storage.js',
    '~/plugins/axios.js',
  ],
  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    '@nuxt/typescript-build',
    '@nuxtjs/vuetify',
    '@nuxtjs/composition-api/module',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
    // https://go.nuxtjs.dev/content
    '@nuxt/content',
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    baseURL: BASE_API_URL || 'http://localhost:3000',
  },

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    manifest: {
      lang: 'en',
    },
  },

  // Content module configuration: https://go.nuxtjs.dev/config-content
  content: {},

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: false,
    },
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {},
}

export default config
