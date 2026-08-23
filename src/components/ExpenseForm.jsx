import { useState } from 'react'
import { todayISODate } from '../utils/format'

// Reusable for both "add new" and "edit existing" (pass `initial`).
// "Spent By" is a plain required text field — not tied to who is logged in
// (everyone currently shares one "General" login) and not yet a dropdown
// (that's a later enhancement). Every field here is required.
export default function ExpenseForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = 'Add Expense',
}) {
  const [spentBy, setSpentBy] = useState(initial?.spentBy || '')
  const [amount, setAmount] = useState(initial?.amount ?? '')
  const [description, setDescription] = useState(initial?.description || '')
  const [date, setDate] = useState(initial?.date || todayISODate())
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const numericAmount = Number(amount)
    if (!spentBy.trim()) {
      setError('Please enter who spent this.')
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
    if (!date) {
      setError('Please pick a date.')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        spentBy: spentBy.trim(),
        amount: numericAmount,
        description: description.trim(),
        date,
      })
      if (!initial) {
        setSpentBy('')
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
        <label htmlFor="expense-spent-by">Spent By</label>
        <input
          id="expense-spent-by"
          type="text"
          placeholder="e.g. Kathan"
          value={spentBy}
          onChange={(e) => setSpentBy(e.target.value)}
          required
        />
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
          required
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
          required
        />
      </div>

      <div className="form-row">
        <label htmlFor="expense-date">Date</label>
        <input
          id="expense-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
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
