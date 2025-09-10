import { ref, reactive, nextTick } from 'vue'

export function useSlidingUnderline(breakpoint = null) {
  const underlineStyle = reactive({
    left: '0px',
    width: '0px',
    opacity: 0
  })

  const containerRef = ref(null)
  const activeItemRef = ref(null)

  // Check if underline should be hidden based on screen width
  const shouldHideForScreenSize = () => {
    if (!breakpoint) return false
    return window.innerWidth <= breakpoint
  }

  const updateUnderlinePosition = () => {
    if (!containerRef.value || !activeItemRef.value) {
      hideUnderline()
      return
    }

    // Hide underline if screen width is at or below breakpoint
    if (shouldHideForScreenSize()) {
      hideUnderline()
      return
    }

    const container = containerRef.value
    const activeItem = activeItemRef.value

    // Get the active item's position relative to the container
    const containerRect = container.getBoundingClientRect()
    const activeRect = activeItem.getBoundingClientRect()

    // Calculate position relative to container
    const left = activeRect.left - containerRect.left
    const width = activeRect.width

    underlineStyle.left = `${left}px`
    underlineStyle.width = `${width}px`
    underlineStyle.opacity = 1
  }

  const hideUnderline = () => {
    underlineStyle.opacity = 0
    underlineStyle.width = '0px'
  }

  const setActiveItem = (element) => {
    if (!element) {
      hideUnderline()
      return
    }
    
    activeItemRef.value = element
    nextTick(() => {
      updateUnderlinePosition()
    })
  }

  const setContainer = (element) => {
    if (!element) return
    
    containerRef.value = element
    nextTick(() => {
      updateUnderlinePosition()
    })
  }

  const handleResize = () => {
    // Always call updateUnderlinePosition to check screen size and update accordingly
    updateUnderlinePosition()
  }

  // Return methods to manually add/remove resize listener
  const addResizeListener = () => {
    window.addEventListener('resize', handleResize)
  }

  const removeResizeListener = () => {
    window.removeEventListener('resize', handleResize)
  }

  return {
    underlineStyle,
    setContainer,
    setActiveItem,
    hideUnderline,
    updateUnderlinePosition,
    addResizeListener,
    removeResizeListener
  }
} 