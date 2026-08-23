import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import NavBar from '../components/NavBar'
import BalanceSummary from '../components/BalanceSummary'
import ExpenseForm from '../components/ExpenseForm'
import ExpenseList from '../components/ExpenseList'
import { useCollection } from '../hooks/useCollection'
import { db } from '../firebase'

// Team members currently share one "General" login, so there's no per-person
// identity to gate edits on. Regular users can only add expenses — editing
// and deleting are admin-only (see AdminDashboard).
export default function UserDashboard() {
  const { data: contributions, loading: loadingContributions } = useCollection('contributions')
  const { data: expenses, loading: loadingExpenses } = useCollection('expenses')

  const totalBudget = contributions.reduce((sum, c) => sum + Number(c.amount || 0), 0)
  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0)

  async function handleAddExpense(values) {
    await addDoc(collection(db, 'expenses'), {
      ...values,
      createdAt: serverTimestamp(),
    })
  }

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
          <h2>Add an expense</h2>
          <ExpenseForm onSubmit={handleAddExpense} />
        </section>

        <section className="panel">
          <h2>All expenses</h2>
          <ExpenseList expenses={expenses} loading={loadingExpenses} canEdit={() => false} />
        </section>
      </main>
    </div>
  )
}
