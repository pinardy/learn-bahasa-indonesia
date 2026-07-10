import { useRef, useState } from 'react'
import type {
  Dispatch,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
  SetStateAction,
} from 'react'

const HOLD_MS = 500
const CANCEL_DISTANCE_PX = 10
const EDGE_ZONE_PX = 36
const EDGE_SCROLL_STEP_PX = 10

// Registered while an item is being dragged so the browser doesn't scroll the
// page/container instead. Must be non-passive for preventDefault to work.
const preventTouchScroll = (e: TouchEvent) => e.preventDefault()

/**
 * Hold-and-drag to rearrange items in a horizontally scrollable container:
 * holding an item for 500ms "lifts" it, then dragging left/right moves it
 * through the row. A normal swipe moves the pointer past a threshold before
 * the timer fires, which cancels the hold so the container scrolls as usual;
 * small jitter is ignored.
 *
 * Draggable elements must be direct children of `containerRef`'s element and
 * spread `pressProps(id)` (which also tags them with `data-drag-id`).
 * `dragging` is the id currently being dragged (for styling); check `wasDrag()`
 * in onClick to skip navigation after a drag.
 */
export function useDragReorder<T extends string>(
  containerRef: RefObject<HTMLElement | null>,
  setOrder: Dispatch<SetStateAction<T[]>>
) {
  const [dragging, setDragging] = useState<T | null>(null)

  const pressTimer = useRef<number>()
  const didDrag = useRef(false)
  const pressStart = useRef<{ x: number; y: number } | null>(null)
  const pressPointerId = useRef<number>()
  const dragItemRef = useRef<T | null>(null)
  const pointerX = useRef(0)
  const rafId = useRef<number>()

  // Runs every frame while dragging: auto-scrolls the container when the
  // pointer is near an edge (so off-screen positions are reachable) and moves
  // the dragged item to the slot under the pointer.
  const dragFrame = () => {
    const container = containerRef.current
    const item = dragItemRef.current
    if (!container || !item) return
    const rect = container.getBoundingClientRect()
    const x = pointerX.current
    if (x < rect.left + EDGE_ZONE_PX) container.scrollLeft -= EDGE_SCROLL_STEP_PX
    else if (x > rect.right - EDGE_ZONE_PX) container.scrollLeft += EDGE_SCROLL_STEP_PX
    // Insertion slot = number of other items whose center is left of the pointer.
    const centers = (Array.from(container.children) as HTMLElement[])
      .filter((el) => el.dataset.dragId && el.dataset.dragId !== item)
      .map((el) => {
        const r = el.getBoundingClientRect()
        return r.left + r.width / 2
      })
    const idx = centers.filter((c) => c < x).length
    setOrder((order) => {
      const rest = order.filter((o) => o !== item)
      const next = [...rest.slice(0, idx), item, ...rest.slice(idx)]
      return next.every((o, i) => o === order[i]) ? order : next
    })
    rafId.current = requestAnimationFrame(dragFrame)
  }

  const onDragMove = (e: PointerEvent) => {
    pointerX.current = e.clientX
  }

  const endDrag = () => {
    dragItemRef.current = null
    setDragging(null)
    if (rafId.current) cancelAnimationFrame(rafId.current)
    window.removeEventListener('touchmove', preventTouchScroll)
    window.removeEventListener('pointermove', onDragMove)
    window.removeEventListener('pointerup', endDrag)
    window.removeEventListener('pointercancel', endDrag)
  }

  const startDrag = (item: T) => {
    didDrag.current = true
    pressStart.current = null
    dragItemRef.current = item
    setDragging(item)
    // Capture so mouse drags keep reporting even outside the window (touch
    // pointers are implicitly captured already).
    try {
      const el = containerRef.current?.querySelector<HTMLElement>(
        `[data-drag-id="${item}"]`
      )
      if (el && pressPointerId.current !== undefined)
        el.setPointerCapture(pressPointerId.current)
    } catch {
      // capture is best-effort
    }
    try {
      navigator.vibrate?.(20)
    } catch {
      // vibration is best-effort
    }
    window.addEventListener('touchmove', preventTouchScroll, { passive: false })
    window.addEventListener('pointermove', onDragMove)
    window.addEventListener('pointerup', endDrag)
    window.addEventListener('pointercancel', endDrag)
    rafId.current = requestAnimationFrame(dragFrame)
  }

  const startPress = (item: T, e: ReactPointerEvent) => {
    // Ignore extra touches while a drag is active (they would hijack the drag
    // and reset the click guard), secondary pointers, and non-left buttons.
    if (dragItemRef.current || !e.isPrimary || e.button !== 0) return
    didDrag.current = false
    pressStart.current = { x: e.clientX, y: e.clientY }
    pressPointerId.current = e.pointerId
    pointerX.current = e.clientX
    pressTimer.current = window.setTimeout(() => startDrag(item), HOLD_MS)
  }
  const onPressMove = (e: ReactPointerEvent) => {
    const s = pressStart.current
    if (!s) return
    if (
      Math.abs(e.clientX - s.x) > CANCEL_DISTANCE_PX ||
      Math.abs(e.clientY - s.y) > CANCEL_DISTANCE_PX
    )
      cancelPress()
  }
  const cancelPress = () => {
    if (pressTimer.current) window.clearTimeout(pressTimer.current)
    pressStart.current = null
  }

  const wasDrag = () => didDrag.current

  const pressProps = (item: T) => ({
    'data-drag-id': item,
    onPointerDown: (e: ReactPointerEvent) => startPress(item, e),
    onPointerUp: cancelPress,
    onPointerLeave: cancelPress,
    onPointerCancel: cancelPress,
    onPointerMove: onPressMove,
    onContextMenu: (e: ReactMouseEvent) => e.preventDefault(),
  })

  return { dragging, wasDrag, pressProps }
}
