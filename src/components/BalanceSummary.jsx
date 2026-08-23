import { formatCurrency } from '../utils/format'

export default function BalanceSummary({ totalBudget, totalSpent, loading }) {
  const remaining = totalBudget - totalSpent

  return (
    <section className="balance-summary" aria-label="Balance summary">
      <div className="stat-card">
        <span className="stat-label">Total Budget</span>
        <span className="stat-value">{loading ? '—' : formatCurrency(totalBudget)}</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Total Spent</span>
        <span className="stat-value">{loading ? '—' : formatCurrency(totalSpent)}</span>
      </div>
      <div className={`stat-card ${remaining < 0 ? 'stat-card-negative' : 'stat-card-positive'}`}>
        <span className="stat-label">Remaining Balance</span>
        <span className="stat-value">{loading ? '—' : formatCurrency(remaining)}</span>
      </div>
    </section>
  )
}
