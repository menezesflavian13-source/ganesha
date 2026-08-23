import { useState } from 'react'
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import NavBar from '../components/NavBar'
import BalanceSummary from '../components/BalanceSummary'
import ExpenseForm from '../components/ExpenseForm'
import ExpenseList from '../components/ExpenseList'
import ContributionForm from '../components/ContributionForm'
import ContributionList from '../components/ContributionList'
import ManageMembers from '../components/ManageMembers'
import { useCollection } from '../hooks/useCollection'
import { db } from '../firebase'

export default function AdminDashboard() {
  const [section, setSection] = useState('expenses')

  const { data: contributions, loading: loadingContributions } = useCollection('contributions')
  const { data: expenses, loading: loadingExpenses } = useCollection('expenses')
  const { data: members, loading: loadingMembers } = useCollection('members', {
    orderByField: 'name',
    direction: 'asc',
  })

  const totalBudget = contributions.reduce((sum, c) => sum + Number(c.amount || 0), 0)
  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0)

  // Contributions: admin-only.
  async function handleAddContribution(values) {
    await addDoc(collection(db, 'contributions'), {
      ...values,
      createdAt: serverTimestamp(),
    })
  }

  async function handleSaveContribution(id, values) {
    await updateDoc(doc(db, 'contributions', id), values)
  }

  async function handleDeleteContribution(id) {
    await deleteDoc(doc(db, 'contributions', id))
  }

  // Expenses: admin can add/edit/delete any, including reassigning who spent it.
  async function handleAddExpense(values) {
    await addDoc(collection(db, 'expenses'), {
      ...values,
      createdAt: serverTimestamp(),
    })
  }

  async function handleSaveExpense(id, values) {
    await updateDoc(doc(db, 'expenses', id), {
      spentBy: values.spentBy,
      amount: values.amount,
      description: values.description,
      date: values.date,
    })
  }

  async function handleDeleteExpense(id) {
    await deleteDoc(doc(db, 'expenses', id))
  }

  // Team members: the login screen's dropdown reads straight from this list.
  async function handleAddMember(name) {
    await addDoc(collection(db, 'members'), { name, createdAt: serverTimestamp() })
  }

  async function handleDeleteMember(id) {
    await deleteDoc(doc(db, 'members', id))
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

        <div className="tabs">
          <button
            type="button"
            className={`tab ${section === 'expenses' ? 'tab-active' : ''}`}
            onClick={() => setSection('expenses')}
          >
            Expenses
          </button>
          <button
            type="button"
            className={`tab ${section === 'contributions' ? 'tab-active' : ''}`}
            onClick={() => setSection('contributions')}
          >
            Contributions
          </button>
          <button
            type="button"
            className={`tab ${section === 'team' ? 'tab-active' : ''}`}
            onClick={() => setSection('team')}
          >
            Team
          </button>
        </div>

        {section === 'expenses' && (
          <>
            <section className="panel">
              <h2>Add an expense</h2>
              <ExpenseForm onSubmit={handleAddExpense} />
            </section>
            <section className="panel">
              <h2>All expenses</h2>
              <ExpenseList
                expenses={expenses}
                loading={loadingExpenses}
                canEdit={() => true}
                onSave={handleSaveExpense}
                onDelete={handleDeleteExpense}
              />
            </section>
          </>
        )}

        {section === 'contributions' && (
          <>
            <section className="panel">
              <h2>Add a contribution</h2>
              <ContributionForm onSubmit={handleAddContribution} />
            </section>
            <section className="panel">
              <h2>All contributions</h2>
              <ContributionList
                contributions={contributions}
                loading={loadingContributions}
                onSave={handleSaveContribution}
                onDelete={handleDeleteContribution}
              />
            </section>
          </>
        )}

        {section === 'team' && (
          <section className="panel">
            <h2>Team members</h2>
            <ManageMembers
              members={members}
              loading={loadingMembers}
              onAdd={handleAddMember}
              onDelete={handleDeleteMember}
            />
          </section>
        )}
      </main>
    </div>
  )
}
