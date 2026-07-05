import { useEffect, useRef, useId } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function useModalA11y(open, onClose) {
  const modalRef = useRef(null)
  const previousFocusRef = useRef(null)
  const titleId = useId()

  useEffect(() => {
    if (!open) return

    previousFocusRef.current = document.activeElement
    document.body.style.overflow = 'hidden'

    const panel = modalRef.current
    if (panel) {
      const focusable = panel.querySelectorAll(FOCUSABLE)
      if (focusable.length > 0) {
        focusable[0].focus()
      }
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return

      const panel = modalRef.current
      if (!panel) return
      const focusable = panel.querySelectorAll(FOCUSABLE)
      if (focusable.length < 2) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
      if (previousFocusRef.current && document.contains(previousFocusRef.current)) {
        previousFocusRef.current.focus()
      }
    }
  }, [open, onClose])

  return { modalRef, titleId }
}
