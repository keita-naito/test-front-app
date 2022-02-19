<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6">
      <div>動画ページ</div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { defineComponent, useContext, useAsync } from '@nuxtjs/composition-api'
export default defineComponent({
  setup() {
    const {} = useContext()

    useAsync(async () => {})

    return {}
  },
})
</script>
