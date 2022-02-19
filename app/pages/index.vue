<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6">
      <div v-for="article in articles" :key="article.id">
        <div>{{ article.content }}</div>
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import {
  defineComponent,
  useContext,
  useAsync,
  computed,
} from '@nuxtjs/composition-api'
export default defineComponent({
  setup() {
    const { store } = useContext()

    useAsync(async () => {
      try {
        await store.dispatch('article/fetchArticles')
      } catch (err) {
        console.log(err)
      }
    })

    const articles = computed(() => {
      return store.getters['article/articles']
    })

    return {
      articles,
    }
  },
})
</script>
