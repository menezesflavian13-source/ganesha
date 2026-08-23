import { useState } from 'react'

export default function ContributionForm({ initial, onSubmit, onCancel, submitLabel = 'Add Contribution' }) {
  const [donorName, setDonorName] = useState(initial?.donorName || '')
  const [amount, setAmount] = useState(initial?.amount ?? '')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const numericAmount = Number(amount)
    if (!donorName.trim()) {
      setError('Please enter a donor name.')
      return
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('Amount must be a positive number.')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({ donorName: donorName.trim(), amount: numericAmount })
      if (!initial) {
        setDonorName('')
        setAmount('')
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
        <label htmlFor="donor-name">Donor Name</label>
        <input
          id="donor-name"
          type="text"
          placeholder="e.g. Sharma family"
          value={donorName}
          onChange={(e) => setDonorName(e.target.value)}
        />
      </div>

      <div className="form-row">
        <label htmlFor="donor-amount">Amount</label>
        <input
          id="donor-amount"
          type="number"
          inputMode="decimal"
          min="0.01"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
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
