import { ref } from 'vue'
import { useWebSocket } from '@vueuse/core'

const throttleTimeouts: { [key: string]: NodeJS.Timeout | null } = {}

function throttle(func: Function, wait: number, key: string) {
  return (...args: any[]) => {
    if (throttleTimeouts[key]) {
      return
    }
    func(...args)
    throttleTimeouts[key] = setTimeout(() => {
      throttleTimeouts[key] = null
    }, wait)
  }
}

function formatDelta(delta: number, precision: number = 2) {
  return Math.round(delta * 10 ** precision) / 10 ** precision
}

export function useServer() {
  const accumulatedDeltaX = ref(0)
  const accumulatedDeltaY = ref(0)
  const accumulatedScrollDeltaX = ref(0)
  const accumulatedScrollDeltaY = ref(0)

  const { status, send } = useWebSocket('/ws', {
    autoReconnect: true,
  })

  const throttledMove = throttle((deltaX: number, deltaY: number) => {
    accumulatedDeltaX.value += deltaX
    accumulatedDeltaY.value += deltaY
    if (Math.abs(accumulatedDeltaX.value) > 1 || Math.abs(accumulatedDeltaY.value) > 1) {
      send(JSON.stringify({ type: 'move', deltaX: formatDelta(accumulatedDeltaX.value), deltaY: formatDelta(accumulatedDeltaY.value) }))
      accumulatedDeltaX.value = 0
      accumulatedDeltaY.value = 0
    }
  }, 50, 'move')

  function move(deltaX: number, deltaY: number) {
    throttledMove(deltaX, deltaY)
  }

  function click() {
    send(JSON.stringify({ type: 'click', button: 'left' }))
  }

  const throttledScroll = throttle((deltaX: number, deltaY: number) => {
    accumulatedScrollDeltaX.value += deltaX
    accumulatedScrollDeltaY.value += deltaY
    if (Math.abs(accumulatedScrollDeltaX.value) > 1 || Math.abs(accumulatedScrollDeltaY.value) > 1) {
      send(JSON.stringify({ type: 'scroll', deltaX: formatDelta(accumulatedScrollDeltaX.value, 1), deltaY: formatDelta(accumulatedScrollDeltaY.value, 1) }))
      accumulatedScrollDeltaX.value = 0
      accumulatedScrollDeltaY.value = 0
    }
  }, 50, 'scroll')

  function scroll(deltaX: number, deltaY: number) {
    throttledScroll(deltaX, deltaY)
  }

  function sendKey(key: string) {
    send(JSON.stringify({ type: 'key', key }))
  }

  function rightClick() {
    send(JSON.stringify({ type: 'rightClick' }))
  }

  function mouseDown() {  
    send(JSON.stringify({ type: 'mouseDown' }))
  }

  function mouseUp() {
    send(JSON.stringify({ type: 'mouseUp' }))
  }

  function log(message: string) {
    send(JSON.stringify({ type: 'log', message }))
  }

  return { status, move, click, scroll, sendKey, rightClick, mouseDown, mouseUp, log }
}
