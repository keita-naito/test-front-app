<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6">
      <div>
        動画ページ
        <hls-player :video-url="resourceUrl" />
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { defineComponent, toRefs, reactive } from '@nuxtjs/composition-api'
import HlsPlayer from '@/components/HlsPlayer.vue'
export default defineComponent({
  components: {
    HlsPlayer,
  },
  setup() {
    const data = reactive({
      resourceUrl: process.env.movieUrl,
    })

    return {
      ...toRefs(data),
    }
  },
})
</script>
