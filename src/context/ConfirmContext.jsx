import { createContext, useCallback, useContext, useRef, useState } from 'react'

const ConfirmContext = createContext(null)

// Lightweight imperative confirm() that returns a Promise<boolean>, so any
// component can do `if (await confirm('Delete this?')) { ... }` without
// prop-drilling a modal component through every list item.
export function ConfirmProvider({ children }) {
  const [request, setRequest] = useState(null)
  const resolverRef = useRef(null)

  const confirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve
      setRequest({ message, confirmLabel: options.confirmLabel || 'Delete' })
    })
  }, [])

  function settle(result) {
    if (resolverRef.current) resolverRef.current(result)
    resolverRef.current = null
    setRequest(null)
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {request && (
        <div className="modal-overlay" role="presentation" onClick={() => settle(false)}>
          <div
            className="modal"
            role="alertdialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="modal-message">{request.message}</p>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => settle(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={() => settle(true)}>
                {request.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used within a ConfirmProvider')
  return ctx
}
