import { useState } from 'react'
import { useConfirm } from '../context/ConfirmContext'

// Admin-only: the list of names team members can pick at login lives in
// Firestore (`members` collection) so it can be managed without touching code.
export default function ManageMembers({ members, loading, onAdd, onDelete }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const confirm = useConfirm()

  async function handleAdd(e) {
    e.preventDefault()
    setError('')
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Enter a name.')
      return
    }
    if (members.some((m) => m.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('That name is already in the list.')
      return
    }
    setSubmitting(true)
    try {
      await onAdd(trimmed)
      setName('')
    } catch (err) {
      setError(err.message || 'Could not add that name.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(member) {
    const ok = await confirm(
      `Remove "${member.name}" from the team list? They won't be able to log in anymore (their past expenses stay on record).`,
      { confirmLabel: 'Remove' }
    )
    if (ok) await onDelete(member.id)
  }

  return (
    <div>
      <form className="form" onSubmit={handleAdd}>
        <div className="form-row">
          <label htmlFor="member-name">Team member name</label>
          <input
            id="member-name"
            type="text"
            placeholder="e.g. Kathan"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        {error && <p className="form-error">{error}</p>}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Adding…' : 'Add'}
          </button>
        </div>
      </form>

      {loading ? (
        <p className="empty-state">Loading team members…</p>
      ) : !members.length ? (
        <p className="empty-state">No team members yet. Add one above.</p>
      ) : (
        <ul className="record-list mt-md">
          {members.map((member) => (
            <li key={member.id} className="record-item">
              <div className="record-main">
                <span className="record-title">{member.name}</span>
              </div>
              <div className="record-actions">
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(member)}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
