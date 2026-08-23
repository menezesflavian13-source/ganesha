import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import NavBar from '../components/NavBar'
import BalanceSummary from '../components/BalanceSummary'
import ExpenseForm from '../components/ExpenseForm'
import ExpenseList from '../components/ExpenseList'
import { useAuth } from '../context/AuthContext'
import { useCollection } from '../hooks/useCollection'
import { db } from '../firebase'

export default function UserDashboard() {
  const { displayName } = useAuth()
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

  async function handleSaveExpense(id, values) {
    // Name is left untouched — a user can only edit the amount/description
    // /date fields on their own expense, never reassign whose it is.
    await updateDoc(doc(db, 'expenses', id), {
      amount: values.amount,
      description: values.description,
      date: values.date,
    })
  }

  async function handleDeleteExpense(id) {
    await deleteDoc(doc(db, 'expenses', id))
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
          <ExpenseForm fixedUserName={displayName} onSubmit={handleAddExpense} />
        </section>

        <section className="panel">
          <h2>All expenses</h2>
          <ExpenseList
            expenses={expenses}
            loading={loadingExpenses}
            canEdit={(expense) => expense.userName === displayName}
            onSave={handleSaveExpense}
            onDelete={handleDeleteExpense}
          />
        </section>
      </main>
    </div>
  )
}
