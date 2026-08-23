import { useState } from 'react'
import ContributionForm from './ContributionForm'
import { useConfirm } from '../context/ConfirmContext'
import { formatCurrency } from '../utils/format'

export default function ContributionList({ contributions, loading, onSave, onDelete }) {
  const [editingId, setEditingId] = useState(null)
  const confirm = useConfirm()

  async function handleDelete(contribution) {
    const ok = await confirm(
      `Delete the ${formatCurrency(contribution.amount)} contribution from ${contribution.donorName}?`
    )
    if (ok) {
      await onDelete(contribution.id)
    }
  }

  if (loading) return <p className="empty-state">Loading contributions…</p>
  if (!contributions.length) return <p className="empty-state">No contributions logged yet.</p>

  return (
    <ul className="record-list">
      {contributions.map((contribution) => {
        const isEditing = editingId === contribution.id

        return (
          <li key={contribution.id} className="record-item">
            {isEditing ? (
              <ContributionForm
                initial={contribution}
                submitLabel="Save"
                onCancel={() => setEditingId(null)}
                onSubmit={async (values) => {
                  await onSave(contribution.id, values)
                  setEditingId(null)
                }}
              />
            ) : (
              <>
                <div className="record-main">
                  <div className="record-heading">
                    <span className="record-title">{contribution.donorName}</span>
                    <span className="record-amount">{formatCurrency(contribution.amount)}</span>
                  </div>
                </div>
                <div className="record-actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setEditingId(contribution.id)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(contribution)}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        )
      })}
    </ul>
  )
}
