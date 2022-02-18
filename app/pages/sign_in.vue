<template>
  <v-row dense :class="style.container">
    <v-card class="mx-auto pa-10" max-width="350" :class="style.card">
      <v-card-title class="mb-4">
        <v-row dense class="justify-center">
          <h2 class="mt-2" :class="style.title">受講生ログイン</h2>
        </v-row>
      </v-card-title>

      <v-form ref="formRef" @submit.prevent>
        <v-text-field
          v-model="email"
          type="email"
          name="email"
          label="メールアドレス"
          data-vv-name="email"
          required
          outlined
          dense
          placeholder="mail@example.com"
          autocomplete="email"
          @keypress.enter="submit"
        ></v-text-field>
        <v-text-field
          v-model="password"
          type="password"
          name="password"
          label="パスワード"
          placeholder="********"
          outlined
          dense
          @keypress.enter="submit"
        />
      </v-form>

      <v-btn
        :elevation="0"
        color="#003973"
        block
        :loading="loading"
        class="white--text font-weight-bold"
        @click="submit"
      >
        ログインする
      </v-btn>
      <v-card-text>
        <v-row dense class="justify-center">
          <div>パスワードを忘れた方はこちら</div>

          <div>認証メールの再送信はこちら</div>
        </v-row>
      </v-card-text>
    </v-card>
  </v-row>
</template>

<script lang="ts">
import camelcaseKeys from 'camelcase-keys'
import {
  defineComponent,
  reactive,
  useRouter,
  useStore,
  ref,
  toRefs,
  useCssModule,
} from '@nuxtjs/composition-api'
export default defineComponent({
  setup() {
    // ルーターを使用
    const router = useRouter()
    // Storeを使用
    const store = useStore()
    // 入力フォームの参照
    const formRef = ref<HTMLFormElement>()
    const data = reactive({
      loading: false,
      email: '',
      password: '',
    })
    const submit = async () => {
      data.loading = true
      const params = camelcaseKeys({
        email: data.email,
        password: data.password,
      })
      try {
        await store.dispatch('sessionUser/signIn', params)
        router.push('/')
      } catch {
      } finally {
        data.loading = false
      }
    }
    return {
      // data
      ...toRefs(data),
      // computed
      // methods
      submit,
      // others
      formRef,
      // style
      style: useCssModule(),
    }
  },
})
</script>

<style lang="scss" module>
.container {
  .title {
    font-size: 1.5rem;
  }
}
</style>
