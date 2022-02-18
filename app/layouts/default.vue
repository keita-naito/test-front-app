<template>
  <v-app :class="style.app">
    <!-- ヘッダー -->
    <v-app-bar app :elevation="1" :class="style.app_bar">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-menu offset-y>
          <template #activator="{ on }">
            <v-btn text v-on="on">
              <v-icon>fas fa-user-circle</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="signOut">
              <v-list-item-content>
                <v-list-item-title>ログアウト</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-toolbar-items>
    </v-app-bar>

    <!-- コンテンツ -->
    <v-main>
      <v-container :class="style.container">
        <nuxt />
      </v-container>
    </v-main>

    <!-- snackbar の表示 -->
    <snackbar
      :visible="snackbarVisible"
      :message="snackbarMessage"
      @close="closeSnackbar()"
    />
  </v-app>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  computed,
  toRefs,
  useStore,
  useRouter,
  useCssModule,
} from '@nuxtjs/composition-api'
export default defineComponent({
  name: 'DefaultLayout',
  components: {},
  setup() {
    const store = useStore()
    const router = useRouter()
    const data = reactive({
      drawer: false,
      items: [
        {
          icon: 'mdi-apps',
          title: 'Welcome',
          to: '/',
        },
        {
          icon: 'mdi-chart-bubble',
          title: 'Inspire',
          to: '/inspire',
        },
      ],
    })
    const signOut = async () => {
      try {
        await store.dispatch('sessionUser/signOut')
        store.dispatch('snackbar/setMessage', 'ログアウトしました')
      } catch {
        store.dispatch('snackbar/setMessage', 'すでにログアウトしています')
      } finally {
        store.dispatch('snackbar/open')
        router.push('/sign_in')
      }
    }
    return {
      // data
      ...toRefs(data),
      // computed
      // methods
      signOut,
      style: useCssModule(),
    }
  },
})
</script>

<style lang="scss" module>
.app {
  .container {
    height: 100%;
  }
  .logo_link {
    height: 100%;
    display: flex;
    align-items: center;
  }
}
.app_bar {
  position: fixed;
  // snackbar を上に表示させるための対応
  z-index: 1 !important;
}
</style>
