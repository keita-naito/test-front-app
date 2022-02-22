<template>
  <div
    id="online-video-player-wrapper"
    ref="onlineVideoPlayerWrapperRef"
    :class="[style.wrapper, { [style.hover]: isShowController }]"
    @mousemove="mousemove"
    @mouseleave="mouseleave"
  >
    <client-only>
      <div v-show="!isLoadedData" :class="style.play_btn_wrapper">
        <v-btn fab text color="transparent" x-large @click="InitializeAndPlay"
          ><v-icon
            v-show="!isInitializedVideo"
            color="#fff"
            :size="$vuetify.breakpoint.xs ? 54 : 72"
            >mdi-arrow-right-drop-circle-outline</v-icon
          >
          <v-progress-circular
            v-show="isInitializedVideo && !isLoadedData"
            indeterminate
            color="#fff"
          ></v-progress-circular
        ></v-btn>
      </div>
      <template v-if="isIos">
        <template v-if="isInitializedVideo">
          <video
            id="online-video-player"
            ref="onlineVideoPlayerRef"
            :class="style.online_video_player"
            width="100%"
            :src="videoUrl"
            autoplay
            @click="togglePlaybackStatus"
            @timeupdate="updateProgressBar"
            @loadeddata="storeVideoTime"
            @ended="ended"
          ></video>
        </template>
      </template>
      <template v-else>
        <video
          id="online-video-player"
          ref="onlineVideoPlayerRef"
          :class="style.online_video_player"
          width="100%"
          @click="togglePlaybackStatus"
          @timeupdate="updateProgressBar"
          @loadeddata="storeVideoTime"
          @ended="ended"
        ></video>
      </template>
      <template v-if="isLoadedData">
        <div
          :class="[
            style.controls_area,
            {
              [style.is_show]: isShowController,
            },
          ]"
        >
          <progress
            ref="progressBarRef"
            :class="style.progress"
            min="0"
            max="100"
            value="0"
            @click="specifyPlaybackPoint($event)"
          >
            0% played
          </progress>

          <div :class="style.controls">
            <div :class="style.left_items">
              <v-btn
                v-show="!isplaying"
                fab
                text
                color="transparent"
                depressed
                x-small
                :class="style.play"
                @click="videoPlay"
                ><v-icon color="#fff" :class="style.icon_size"
                  >mdi-play</v-icon
                ></v-btn
              >
              <v-btn
                v-show="isplaying"
                fab
                text
                color="transparent"
                depressed
                x-small
                :class="style.stop"
                @click="videoStop"
                ><v-icon v-show="isplaying" color="#fff"
                  >mdi-pause</v-icon
                ></v-btn
              >
              <template v-if="$vuetify.breakpoint.xsOnly">
                <div :class="style.video_time">
                  <div>{{ videoCurrentTime }}</div>
                </div>
              </template>
              <template v-else>
                <div :class="style.video_time">
                  <div>{{ videoCurrentTime }} / {{ videoTotalTime }}</div>
                </div>
              </template>
              <div :class="style.value_area">
                <v-btn
                  :class="style.volume_btn"
                  text
                  @click="toggleVolumeOnAndOff"
                >
                  <v-icon v-show="volume <= '0'" left right color="#fff"
                    >mdi-volume-mute</v-icon
                  >

                  <v-icon
                    v-show="volume > '0' && volume < '1'"
                    left
                    right
                    color="#fff"
                    >mdi-volume-medium</v-icon
                  >

                  <v-icon v-show="volume >= '1'" left right color="#fff"
                    >mdi-volume-high</v-icon
                  >
                </v-btn>
                <v-slider
                  v-model="volume"
                  :class="style.volume_bar"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  color="#ffffff"
                  track-color="#929292"
                  @change="changeVolume"
                />
              </div>
            </div>
            <div :class="style.right_items">
              <v-btn
                text
                :class="style.config"
                @click="isShowSettingList = !isShowSettingList"
                ><v-icon color="#fff">mdi-cog</v-icon></v-btn
              >
              <template v-if="isShowSettingList">
                <div
                  :class="style.overlay"
                  @click="isShowSettingList = !isShowSettingList"
                ></div>

                <v-card dark :class="style.cog_card" color="transparent">
                  <v-list color="rgba(0,0,0,0.5)">
                    <v-list-item>
                      <v-list-item-content>
                        <v-list-item-title>再生速度</v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>

                  <v-divider></v-divider>

                  <v-list color="rgba(0,0,0,0.5)">
                    <v-list-item :class="style.speed_list">
                      <v-radio-group
                        v-model="playbackSpeed"
                        dense
                        @change="changePlaybackSpeed"
                      >
                        <div
                          v-for="playbackSpeedSetting in playbackSpeedSettingList"
                          :key="playbackSpeedSetting.display"
                        >
                          <v-radio
                            class="my-1"
                            :label="playbackSpeedSetting.display"
                            :value="playbackSpeedSetting.speed"
                          ></v-radio>
                        </div>
                      </v-radio-group>
                    </v-list-item>
                  </v-list>
                </v-card>
              </template>
              <template v-if="!isIos">
                <v-btn text :class="style.fullscreen" @click="toggleFullscreen"
                  ><v-icon v-show="isFullscreen" color="#fff"
                    >mdi-fullscreen-exit</v-icon
                  ><v-icon v-show="!isFullscreen" color="#fff"
                    >mdi-fullscreen</v-icon
                  ></v-btn
                >
              </template>
            </div>
          </div>
        </div>
      </template>
    </client-only>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  reactive,
  toRefs,
  useCssModule,
  useContext,
  ref,
  onUpdated,
} from '@nuxtjs/composition-api'
import Hls from 'hls.js'

export default defineComponent({
  props: {
    videoUrl: {
      type: String,
      required: true,
      default: '',
    },
  },

  setup(props, context) {
    const { store } = useContext()

    const data = reactive({
      isplaying: false,
      isInitializedVideo: false,
      isLoadedData: false,
      isShowController: false,
      timer: null,
      isFullscreen: false,
      volume: 1,
      previousVolume: 0,
      playbackSpeed: 1,
      isShowPlaybackSpeedPanel: false,
      isShowSettingList: false,
      videoCurrentTime: '0',
      videoTotalTime: '0',
    })

    const playbackSpeedSettingList = [
      { speed: 0.5, display: '0.5' },
      { speed: 0.75, display: '0.75' },
      { speed: 1, display: '標準' },
      { speed: 1.25, display: '1.25' },
      { speed: 1.5, display: '1.5' },
      { speed: 1.75, display: '1.75' },
      { speed: 2, display: '2' },
    ]

    interface FullScreenElement {
      webkitRequestFullscreen(): void // Chrome, Safari
      mozRequestFullScreen(): void // FF
      msRequestFullscreen(): void // IE
      requestFullscreen(): void // Others
    }

    const onlineVideoPlayerRef = ref<HTMLMediaElement>()
    const onlineVideoPlayerWrapperRef = ref<FullScreenElement>()
    const progressBarRef = ref<HTMLProgressElement>()

    // NOTE: 初期表示で video 上にカーソルが表示されないため残しておく
    onUpdated(() => {
      if (!data.isInitializedVideo) {
        data.isShowController = true
      }
    })

    const isIos = computed(() => {
      if (process.client) {
        const userAgent = navigator.userAgent
        return (
          userAgent.indexOf('iPhone') > 0 ||
          (userAgent.indexOf('Macintosh') > 0 && 'ontouchend' in document) // iPad の確認
        )
      }
    })

    const InitializeAndPlay = () => {
      data.isInitializedVideo = true
      const video = onlineVideoPlayerRef.value as HTMLMediaElement

      if (Hls.isSupported()) {
        const hls = new Hls()
        hls.loadSource(props.videoUrl)
        hls.attachMedia(video)
      }

      // iOSの場合、読み込みが完了したタイミングで時点で自動再生になる
      if (isIos.value) {
        data.isplaying = true
      } else {
        videoPlay()
      }
    }

    const videoPlay = () => {
      data.isplaying = true
      const video = onlineVideoPlayerRef.value as HTMLMediaElement
      video.play()
    }

    const videoStop = () => {
      const video = onlineVideoPlayerRef.value as HTMLMediaElement
      data.isplaying = false
      video.pause()
    }

    const togglePlaybackStatus = () => {
      if (data.isInitializedVideo) {
        if (data.isplaying) {
          videoStop()
        } else {
          videoPlay()
        }
      }
    }

    const videoFullscreen = () => {
      data.isFullscreen = true
      const target = onlineVideoPlayerWrapperRef.value as FullScreenElement
      if (target.webkitRequestFullscreen) {
        target.webkitRequestFullscreen() // Chrome, Safari
      } else if (target.mozRequestFullScreen) {
        target.mozRequestFullScreen() // FF
      } else if (target.msRequestFullscreen) {
        target.msRequestFullscreen() // IE
      } else if (target.requestFullscreen) {
        target.requestFullscreen() // HTML5 Fullscreen API仕様
      } else {
        store.dispatch(
          'snackbar/setMessage',
          'ご利用のブラウザはフルスクリーン操作に対応していません'
        )
        store.dispatch('snackbar/openError')
      }
    }

    const videoCancelFullscreen = () => {
      data.isFullscreen = false
      // NOTE: 型定義による指摘を黙らせるために any 型としておく
      const document: any = window.document
      if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen() // Chrome, Safari
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen() // FF
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen() // IE
      } else if (document.cancelFullScreen) {
        document.cancelFullScreen() // Gecko:FullScreenAPI仕様
      } else if (document.exitFullscreen) {
        document.exitFullscreen() // HTML5 Fullscreen API仕様
      }
    }

    const toggleFullscreen = () => {
      if (data.isFullscreen) {
        videoCancelFullscreen()
      } else {
        videoFullscreen()
      }
    }

    const changeVolume = () => {
      const video = onlineVideoPlayerRef.value as HTMLMediaElement
      video.volume = data.volume
    }

    const changePlaybackSpeed = () => {
      const video = onlineVideoPlayerRef.value as HTMLMediaElement
      video.playbackRate = data.playbackSpeed
      data.isShowSettingList = false
    }

    const updateProgressBar = () => {
      // DevToolsのSP表示だとなぜか当メソッドがページ遷移時に走ってしまって500エラーがでていたので調整（DevToolsのSP表示でのみ発生しているが念のため)
      if (data.isLoadedData) {
        const progressBar = progressBarRef.value as HTMLProgressElement
        const video = onlineVideoPlayerRef.value as HTMLMediaElement
        const percentage = 100 * (video.currentTime / video.duration)
        progressBar.value = percentage
        progressBar.innerHTML = percentage + '% played'

        data.videoTotalTime = convertVideoTime(video, video.duration)
        data.videoCurrentTime = convertVideoTime(video, video.currentTime)
      }
    }

    const convertVideoTime = (video: any, videoTime: any) => {
      const baseHour = Math.trunc(videoTime / 60 / 60)
      const hour = ('00' + baseHour).slice(-2)
      const baseMin = Math.trunc(videoTime / 60) % 60
      const min = ('00' + baseMin).slice(-2)
      const baseSec = Math.trunc(videoTime) % 60
      const sec = ('00' + baseSec).slice(-2)

      const isOverAnHour = Boolean(Math.trunc(video.duration / 60 / 60))
      if (isOverAnHour) {
        // HH:MM:SS の形にして返す
        return `${hour}:${min}:${sec}`
      } else {
        // MM:SS の形にして返す
        return `${min}:${sec}`
      }
    }

    const storeVideoTime = () => {
      const video = onlineVideoPlayerRef.value as HTMLMediaElement
      data.videoCurrentTime = convertVideoTime(video, video.currentTime)
      data.videoTotalTime = convertVideoTime(video, video.duration)
      data.isLoadedData = true
    }

    const specifyPlaybackPoint = (e: any) => {
      const progressBar = progressBarRef.value as HTMLProgressElement
      const video = onlineVideoPlayerRef.value as HTMLMediaElement
      const percent = e.offsetX / progressBar.offsetWidth
      video.currentTime = percent * video.duration
      e.target.value = percent / 100
      e.target.innerHTML = progressBar.value + '% played'
    }

    const ended = () => {
      context.emit('ended')
    }

    const mousemove = () => {
      if (data.isplaying) {
        data.isShowController = true
      }

      if (data.timer) {
        const timer = data.timer as any
        clearTimeout(timer)
      }

      data.timer = setTimeout(() => {
        data.isShowController = false
      }, 3000) as any
    }

    const mouseleave = () => {
      if (data.isplaying) {
        data.isShowController = false
      }
      const timer = data.timer as any
      clearTimeout(timer)
    }

    // 音声アイコンをクリックした時に、音量の ON と OFF を切り替える
    const toggleVolumeOnAndOff = () => {
      const video = onlineVideoPlayerRef.value as HTMLMediaElement

      if (data.volume > 0) {
        // volume を一時保存してから 0 にする
        data.previousVolume = video.volume

        data.volume = 0
        video.volume = 0
      } else {
        // もう1度音声アイコンを押したら、元のボリュームに戻す
        data.volume = data.previousVolume
        video.volume = data.previousVolume
      }
    }

    return {
      // data
      ...toRefs(data),

      // const
      playbackSpeedSettingList,

      // computed
      isIos,

      // methods
      convertVideoTime,
      InitializeAndPlay,
      storeVideoTime,
      videoPlay,
      videoStop,
      togglePlaybackStatus,
      videoFullscreen,
      videoCancelFullscreen,
      toggleFullscreen,
      changeVolume,
      changePlaybackSpeed,
      updateProgressBar,
      specifyPlaybackPoint,
      ended,
      mousemove,
      mouseleave,
      toggleVolumeOnAndOff,

      // others
      onlineVideoPlayerRef,
      onlineVideoPlayerWrapperRef,
      progressBarRef,

      style: useCssModule(),
    }
  },
})
</script>

<style lang="scss" module>
.online_video_player {
  position: absolute;
  height: -webkit-fill-available;
}

// FIXME: safariにおいて上の設定だと動画が表示されないので初期値に戻す
// ただしアスペクト比が通常でない動画はデザインが崩れる
_:lang(x) + _:-webkit-full-screen-document,
.online_video_player {
  position: inherit;
  height: auto;
}

.icon_size {
  font-size: 36px;
}

.wrapper {
  position: relative;
  height: 0;
  padding-bottom: 56.25%;
  cursor: none;

  .play_btn_wrapper {
    position: absolute;
    height: 255px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -15%);
    z-index: 1;
    @include below-xs {
      height: 174px;
      transform: translate(-50%, -20%);
    }
  }

  &:fullscreen {
    padding-bottom: 0;
  }

  &:-webkit-full-screen {
    padding-bottom: 56.25%;
  }

  .controls_area {
    background: linear-gradient(transparent, 20%, rgba(0, 0, 0, 0.65));
  }

  &.hover {
    cursor: default;
  }

  .controls_area {
    display: flex;
    flex-wrap: wrap;
    opacity: 0;
    position: absolute;
    bottom: 0;
    width: 100%;
    transition: opacity 0.5s ease;
    // コントロールの背景色を黒くする場合はコメントイン
    /* background-color: #000; */

    &.is_show {
      opacity: 1;
    }

    // プログレスバー
    progress {
      color: #69abea;
      font-size: 12px;
      margin: 8px 12px 0;
      width: 100%;
      height: 10px;
      &:hover {
        cursor: pointer;
      }
    }
    progress::-moz-progress-bar {
      color: #69abea;
      background: #d5d5d5;
    }

    progress[value]::-webkit-progress-bar {
      background-color: #d5d5d5;
    }

    progress[value]::-webkit-progress-value {
      background-color: #69abea;
    }

    // 各種ボタンのスタイル
    .controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;

      .left_items {
        display: flex;

        .play {
          margin: 0;
          padding: 0;
          padding-left: 32px;
          min-width: 0;
        }

        .stop {
          margin: 0;
          padding: 0;
          padding-left: 32px;
          min-width: 0;
        }

        .video_time {
          color: #fff;
          padding: 0 12px 2px 32px;
          display: flex;
          align-items: center;
          @include below-xs {
            font-size: 12px;
            padding: 0 0 2px 24px;
          }
        }

        .value_area {
          display: flex;
          align-items: center;
          .volume_btn {
            padding: 0 4px;
            min-width: 0;
          }
          .volume_bar {
            width: 100px;
            margin-bottom: 0;
          }
        }
      }

      .right_items {
        display: flex;
        .config {
          margin: 0;
          padding: 0;
          padding-right: 16px;
          min-width: 0;
        }

        .fullscreen {
          margin: 0;
          padding: 0;
          padding-right: 16px;
          min-width: 0;
        }
      }

      .cog_card {
        position: absolute;
        right: 12px;
        bottom: 44px;
        width: 150px;
        z-index: 11;
      }

      .speed_list {
        padding-top: 112px;
        max-height: 100px;
        overflow-y: scroll;
      }

      .overlay {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 10;
        height: 100%;
        width: 100%;
      }
    }
  }
}
</style>

<style lang="scss">
// 全画面にした際に video タグを全画面表示にする設定
#online-video-player-wrapper {
  background-color: #000;
  &:fullscreen {
    #online-video-player {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      max-height: 100vh;
    }
  }

  // コントロールアイコンのサイズ調整
  .mdi-play::before,
  .mdi-pause::before,
  .mdi-fullscreen::before,
  .mdi-fullscreen-exit::before {
    font-size: 30px;
  }

  // 不要な要素の削除
  .v-messages.theme--light {
    display: none;
  }

  // 不要な要素の削除
  .v-input__slot {
    margin-bottom: 0;
  }

  // ボリュームバーの太さ調整
  .v-slider--horizontal .v-slider__track-background,
  .v-slider--horizontal .v-slider__track-fill {
    height: 4px;
    margin-top: -1px;
  }
}
</style>
