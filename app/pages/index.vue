
<script setup lang="ts">
import { ref, watch } from 'vue'
import type { WebSocketStatus } from '@vueuse/core'
import { useServer } from '~/composables/useServer'
import { createTouchHandler } from '~/composables/createTouchHandler'

const status = ref(false)
const { 
  status: wsStatus, 
  move, 
  click, 
  scroll, 
  sendKey, 
  rightClick, 
  mouseDown, 
  mouseUp, 
  log 
} = useServer()

const { request } = useWakeLock()
request('screen')

watch(wsStatus, (newStatus: WebSocketStatus) => {
  status.value = newStatus
})

const increaseVolume = () => {
  sendKey('audio_vol_up')
}

const decreaseVolume = () => {
  sendKey('audio_vol_down')
}

const togglePlayPause = () => {
  sendKey('audio_play')
}

const {
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
} = createTouchHandler({ 
  move, 
  click, 
  scroll, 
  rightClick, 
  mouseDown, 
  mouseUp, 
  log 
})
</script>

<template >

  <div 
    id="statusIndicator"
    :class="[status === 'OPEN' ? 'bg-green-500' : 'bg-red-500']"
    class="h-4 w-4 rounded-full absolute top-4 right-4"
  />

  <div class="flex flex-col w-full flex-grow p-4">
    <div class="flex space-x-4 mb-4">
      <UButton @click="decreaseVolume">
        <UIcon name="i-material-symbols-volume-down" class="text-4xl" />
      </UButton>
      <UButton @click="increaseVolume">
        <UIcon name="i-material-symbols-volume-up" class="text-4xl" />
      </UButton>
      <UButton @click="togglePlayPause">
        <UIcon name="i-ph-play-pause-fill" class="text-4xl" />
      </UButton>
      <UButton @click="togglePlayPause">
        <UIcon name="i-ph-play-pause-fill" class="text-4xl" />
      </UButton>
    </div>

    <div
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      class="w-full h-48 rounded mb-4 flex-grow"
      style="background: radial-gradient(rgba(255, 255, 255, 0.1) 2px, transparent 1px), radial-gradient(rgba(255, 255, 255, 0.1) 2px, transparent 1px); background-size: 24px 24px, 24px 24px;"
    />
  </div>
</template>
