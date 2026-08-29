import NavBar from '../components/NavBar'
import BalanceSummary from '../components/BalanceSummary'
import ExpenseList from '../components/ExpenseList'
import { useCollection } from '../hooks/useCollection'

// Team members have view-only access to expenses: no add, no edit, no
// delete. All expense management is admin-only (see AdminDashboard).
export default function UserDashboard() {
  const { data: contributions, loading: loadingContributions } = useCollection('contributions')
  const { data: expenses, loading: loadingExpenses } = useCollection('expenses')

  const totalBudget = contributions.reduce((sum, c) => sum + Number(c.amount || 0), 0)
  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0)

  return (
    <div className="page">
      <NavBar />
      <main className="page-content">
        <BalanceSummary
          totalBudget={totalBudget}
          totalSpent={totalSpent}
          loading={loadingContributions || loadingExpenses}
        />

        <section className="panel">
          <h2>All expenses</h2>
          <ExpenseList expenses={expenses} loading={loadingExpenses} canEdit={() => false} />
        </section>
      </main>
    </div>
  )
}
