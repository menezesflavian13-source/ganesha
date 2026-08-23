import { useState } from 'react'
import ExpenseForm from './ExpenseForm'
import { useConfirm } from '../context/ConfirmContext'
import { formatCurrency, formatDate } from '../utils/format'

// `canEdit(expense)` decides per-row whether Edit/Delete show up — the
// caller passes the actual authorization logic (admin, or "is my own row").
export default function ExpenseList({
  expenses,
  loading,
  canEdit,
  allowUserNameSelect = false,
  members = [],
  onSave,
  onDelete,
}) {
  const [editingId, setEditingId] = useState(null)
  const confirm = useConfirm()

  async function handleDelete(expense) {
    const ok = await confirm(
      `Delete "${expense.description}" (${formatCurrency(expense.amount)}) by ${expense.userName}?`
    )
    if (ok) {
      await onDelete(expense.id)
    }
  }

  if (loading) return <p className="empty-state">Loading expenses…</p>
  if (!expenses.length) return <p className="empty-state">No expenses logged yet.</p>

  return (
    <ul className="record-list">
      {expenses.map((expense) => {
        const editable = canEdit(expense)
        const isEditing = editingId === expense.id

        return (
          <li key={expense.id} className="record-item">
            {isEditing ? (
              <ExpenseForm
                initial={expense}
                fixedUserName={expense.userName}
                allowUserNameSelect={allowUserNameSelect}
                members={members}
                submitLabel="Save"
                onCancel={() => setEditingId(null)}
                onSubmit={async (values) => {
                  await onSave(expense.id, values)
                  setEditingId(null)
                }}
              />
            ) : (
              <>
                <div className="record-main">
                  <div className="record-heading">
                    <span className="record-title">{expense.description}</span>
                    <span className="record-amount">{formatCurrency(expense.amount)}</span>
                  </div>
                  <div className="record-meta">
                    <span>{expense.userName}</span>
                    <span>•</span>
                    <span>{formatDate(expense.date)}</span>
                  </div>
                </div>
                {editable && (
                  <div className="record-actions">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setEditingId(expense.id)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(expense)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </>
            )}
          </li>
        )
      })}
    </ul>
  )
}
