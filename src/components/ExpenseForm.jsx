import { useState } from 'react'
import { todayISODate } from '../utils/format'

// Reusable for both "add new" and "edit existing" (pass `initial`).
// `fixedUserName` locks the name field for a regular user adding their own
// expense. `allowUserNameSelect` + `members` lets an admin pick/reassign the
// name from the Firestore-managed team list.
export default function ExpenseForm({
  initial,
  fixedUserName,
  allowUserNameSelect = false,
  members = [],
  onSubmit,
  onCancel,
  submitLabel = 'Add Expense',
}) {
  const [userName, setUserName] = useState(initial?.userName || fixedUserName || '')
  const [amount, setAmount] = useState(initial?.amount ?? '')
  const [description, setDescription] = useState(initial?.description || '')
  const [date, setDate] = useState(initial?.date || todayISODate())
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const numericAmount = Number(amount)
    if (!userName) {
      setError('Please choose a name.')
      return
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('Amount must be a positive number.')
      return
    }
    if (!description.trim()) {
      setError('Please add a short description.')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        userName,
        amount: numericAmount,
        description: description.trim(),
        date,
      })
      if (!initial) {
        // Reset for the next entry, but keep the acting user's name.
        setAmount('')
        setDescription('')
        setDate(todayISODate())
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label htmlFor="expense-name">Name</label>
        {allowUserNameSelect ? (
          <select
            id="expense-name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          >
            <option value="" disabled>
              Select a name
            </option>
            {members.map((member) => (
              <option key={member.id} value={member.name}>
                {member.name}
              </option>
            ))}
          </select>
        ) : (
          <input id="expense-name" type="text" value={userName} disabled readOnly />
        )}
      </div>

      <div className="form-row">
        <label htmlFor="expense-amount">Amount</label>
        <input
          id="expense-amount"
          type="number"
          inputMode="decimal"
          min="0.01"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className="form-row">
        <label htmlFor="expense-description">Description</label>
        <input
          id="expense-description"
          type="text"
          placeholder="e.g. Flowers for the mandap"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="form-row">
        <label htmlFor="expense-date">Date</label>
        <input
          id="expense-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
