import { mouse, Point, Button, keyboard, Key } from '@nut-tree-fork/nut-js'

let scrollSpeedX = 0
let scrollSpeedY = 0
let targetX = 0
let targetY = 0
let moveAnimationId: NodeJS.Timeout | null = null
let scrollAnimationId: NodeJS.Timeout | null = null

export default defineWebSocketHandler({
  open(peer) {
    console.log("[ws] open", peer)
  },

  async message(peer, message) {
    console.log("[ws] message", peer, message)
    
    try {
      const data = JSON.parse(message.text())
      switch (data.type) {
        case 'log':
          console.log(data.message)
          break
        case 'move':
          await moveCursor(data.deltaX, data.deltaY)
          break
        case 'click':
          await handleClick(data.button)
          break
        case 'scroll':
          await handleScroll(data.deltaX, data.deltaY)
          break
        case 'move_up':
          await moveCursorUp(10)
          break
        case 'key':
          await handleKey(data.key)
          break
        case 'rightClick':
          await handleRightClick()
          break
        case 'mouseDown':
          await handleMouseDown()
          break
        case 'mouseUp':
          await handleMouseUp()
          break
        default:
          console.log('Unknown message type:', data.type)
      }
    } catch (error) {
      console.error('Error processing message:', error)
    }
  },

  close(peer, event) {
    console.log("[ws] close", peer, event)
  },

  error(peer, error) {
    console.log("[ws] error", peer, error)
  },
})

async function moveCursorUp(pixels: number) {
  const currentPosition = await mouse.getPosition()
  await mouse.setPosition(new Point(currentPosition.x, currentPosition.y - pixels))
}

async function moveCursor(deltaX: number, deltaY: number) {
  let { x: currentX, y: currentY } = await mouse.getPosition()
  const normalizedDeltaX = Math.abs(deltaX) ** 1.2 * Math.sign(deltaX)
  const normalizedDeltaY = Math.abs(deltaY) ** 1.2 * Math.sign(deltaY)
  if (moveAnimationId) {
    targetX += normalizedDeltaX
    targetY += normalizedDeltaY
    clearTimeout(moveAnimationId)
  } else {
    targetX = currentX + normalizedDeltaX
    targetY = currentY + normalizedDeltaY
  }

  let duration = 60

  function animation() {
    const distanceToTargetX = targetX - currentX
    const distanceToTargetY = targetY - currentY
  
    const interval = 8
    duration -= interval

    if (duration <= 0) {
      mouse.setPosition(new Point(targetX, targetY))
      moveAnimationId = null
      return
    }

    const partOfDistance = duration / interval
    const stepX = distanceToTargetX / partOfDistance
    const stepY = distanceToTargetY / partOfDistance

    currentX += stepX
    currentY += stepY

    mouse.setPosition(new Point(Math.round(currentX), Math.round(currentY)))

    if (distance(currentX, currentY, targetX, targetY) > 1) {
      moveAnimationId = setTimeout(animation, interval)
    } else {    
      moveAnimationId = null
    }
  }

  animation()
}

function distance(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
}

async function handleClick(button: string) {
  const nutButton = button === 'left' ? Button.LEFT : Button.RIGHT
  await mouse.click(nutButton)
}

async function handleScroll(deltaX: number, deltaY: number) {
  const scrollAmountX = Math.sign(deltaX) * Math.min(Math.abs(deltaX), 100) * 5
  const scrollAmountY = Math.sign(deltaY) * Math.min(Math.abs(deltaY), 100) * 5
  scrollSpeedX += scrollAmountX
  scrollSpeedY += scrollAmountY

  if (scrollAnimationId) {
    clearTimeout(scrollAnimationId)
  }

  const scroll = () => {
    if (Math.abs(scrollSpeedX) > 0 || Math.abs(scrollSpeedY) > 0) {
      mouse.scrollUp(scrollSpeedY)
      mouse.scrollRight(scrollSpeedX)
      scrollSpeedX *= 0.9 // Decrease speed for inertia effect
      scrollSpeedY *= 0.9 // Decrease speed for inertia effect
      scrollAnimationId = setTimeout(scroll, 16)
    } else {
      scrollSpeedX = 0
      scrollSpeedY = 0
    }
  }

  scrollAnimationId = setTimeout(scroll, 16)
}

async function handleKey(key: string) {
  let keyToPress: Key
  switch (key) {
    case 'audio_vol_up':
      keyToPress = Key.AudioVolUp
      break
    case 'audio_vol_down':
      keyToPress = Key.AudioVolDown
      break
    case 'audio_play':
      keyToPress = Key.AudioPlay
      break
    default:
      console.error('Unknown key:', key)
      return
  }
  
  await keyboard.pressKey(keyToPress)
  await keyboard.releaseKey(keyToPress)
}

async function handleRightClick() {
  await mouse.click(Button.RIGHT)
}

async function handleMouseDown() {
  await mouse.pressButton(Button.LEFT)
}

async function handleMouseUp() {
  await mouse.releaseButton(Button.LEFT)
}