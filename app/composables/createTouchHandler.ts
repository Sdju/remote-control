interface TouchHandler {  
  move: (x: number, y: number) => void
  click: () => void
  scroll: (deltaX: number, deltaY: number) => void
  rightClick: () => void
  mouseDown: () => void
  mouseUp: () => void
  log: (message: string) => void
}

export function createTouchHandler({ move, click, scroll, rightClick, mouseDown, mouseUp, log }: TouchHandler) {
  let isDragging = false
  let lastX = 0
  let lastY = 0
  let accumulatedDeltaX = 0
  let accumulatedDeltaY = 0
  let accumulatedScrollDeltaX = 0
  let accumulatedScrollDeltaY = 0
  let lastMoveTime = 0
  let touchStartTime = 0
  let lastTouchDistance = 0
  let touchStartX = 0
  let touchStartY = 0
  let isLongPress = false
  let longPressTimer: NodeJS.Timeout | null = null
  let twoFingerStartX = 0
  let twoFingerStartY = 0
  let twoFingerStartTime = 0
  let isTwoFingerGesture = false

  function handleTouchStart(event: TouchEvent) {
    event.preventDefault()
    isDragging = true
    touchStartTime = new Date().getTime()
    
    if (event.touches.length === 1) {
      lastX = event.touches[0].clientX
      lastY = event.touches[0].clientY
      touchStartX = event.touches[0].clientX
      touchStartY = event.touches[0].clientY
      longPressTimer = setTimeout(() => {
        isLongPress = true
        mouseDown()
      }, 300)
    } else if (event.touches.length === 2) {
      isTwoFingerGesture = true
      twoFingerStartTime = new Date().getTime()
      twoFingerStartX = (event.touches[0].clientX + event.touches[1].clientX) / 2
      twoFingerStartY = (event.touches[0].clientY + event.touches[1].clientY) / 2
      lastTouchDistance = getTouchDistance(event.touches)
    }
  }

  function handleTouchMove(event: TouchEvent) {
    event.preventDefault()
    if (!isDragging) return
    
    const currentTime = new Date().getTime()
    
    if (event.touches.length === 1) {
      const deltaX = event.touches[0].clientX - lastX
      const deltaY = event.touches[0].clientY - lastY
      lastX = event.touches[0].clientX
      lastY = event.touches[0].clientY
      
      accumulatedDeltaX += deltaX
      accumulatedDeltaY += deltaY

      if (currentTime - lastMoveTime > 50) {
        if (Math.abs(accumulatedDeltaX) > 1 || Math.abs(accumulatedDeltaY) > 1) {
          move(accumulatedDeltaX, accumulatedDeltaY)
          accumulatedDeltaX = 0
          accumulatedDeltaY = 0
          lastMoveTime = currentTime
        }
      }
    } else if (event.touches.length === 2) {
      const currentCenterX = (event.touches[0].clientX + event.touches[1].clientX) / 2
      const currentCenterY = (event.touches[0].clientY + event.touches[1].clientY) / 2
      
      const deltaX = currentCenterX - twoFingerStartX
      const deltaY = currentCenterY - twoFingerStartY
      
      twoFingerStartX = currentCenterX
      twoFingerStartY = currentCenterY
      
      scroll(deltaX, deltaY)
    }

    if (longPressTimer) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }
    
    if (isLongPress) return
  }

  function handleTouchEnd(event: TouchEvent) {
    event.preventDefault()
    isDragging = false
    const touchEndTime = new Date().getTime()

    if (longPressTimer) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }

    if (isLongPress) {
      mouseUp()
      isLongPress = false
      return
    }

    if (isTwoFingerGesture) {
      isTwoFingerGesture = false
      const twoFingerDuration = touchEndTime - twoFingerStartTime
      const endX = (event.changedTouches[0].clientX + event.touches[0].clientX) / 2
      const endY = (event.changedTouches[0].clientY + event.touches[0].clientY) / 2
      const distance = Math.sqrt(Math.pow(endX - twoFingerStartX, 2) + Math.pow(endY - twoFingerStartY, 2))
      
      if (distance < 10 && twoFingerDuration < 300) {
        rightClick()
      }
    } else {
      const endX = event.changedTouches[0].clientX
      const endY = event.changedTouches[0].clientY
      const distance = Math.sqrt(Math.pow(endX - touchStartX, 2) + Math.pow(endY - touchStartY, 2))

      if (distance < 10) {
        click()
      }
    }

    if (Math.abs(accumulatedDeltaX) > 1 || Math.abs(accumulatedDeltaY) > 1) {
      move(accumulatedDeltaX, accumulatedDeltaY)
      accumulatedDeltaX = 0
      accumulatedDeltaY = 0
    }
    if (Math.abs(accumulatedScrollDeltaX) > 1 || Math.abs(accumulatedScrollDeltaY) > 1) {
      scroll(accumulatedScrollDeltaX, accumulatedScrollDeltaY)
      accumulatedScrollDeltaX = 0
      accumulatedScrollDeltaY = 0
    }
  }

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  }
}

function getTouchDistance(touches: TouchList) {
  const dx = touches[0].clientX - touches[1].clientX
  const dy = touches[0].clientY - touches[1].clientY
  return Math.sqrt(dx * dx + dy * dy)
}