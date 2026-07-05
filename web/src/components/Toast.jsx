import { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

const COLORS = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
}

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
}

let toastId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const remove = useCallback((id) => {
    clearTimeout(timers.current[id])
    delete timers.current[id]
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const add = useCallback((type, message) => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, type, message }])
    timers.current[id] = setTimeout(() => remove(id), 4000)
    return id
  }, [remove])

  const toast = useMemo(() => ({
    success: (msg) => add('success', msg),
    error: (msg) => add('error', msg),
    info: (msg) => add('info', msg),
  }), [add])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          const Icon = ICONS[t.type]
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg transition-all duration-300 animate-in slide-in-from-right ${COLORS[t.type]}`}
            >
              <Icon size={18} className="shrink-0 mt-0.5" />
              <span className="text-sm flex-1">{t.message}</span>
              <button
                onClick={() => remove(t.id)}
                className="shrink-0 cursor-pointer opacity-60 hover:opacity-100"
              >
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
