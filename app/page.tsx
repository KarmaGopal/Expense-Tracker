'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function HomePage() {
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [expenses, setExpenses] = useState<any[]>([])
  const totalAmount = expenses.reduce(
  (sum, expense) => sum + Number(expense.amount),
  0
)
  const fetchExpenses = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.log('No logged in user')
    return
  }

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.log(error)
    return
  }

  setExpenses(data || [])
}


useEffect(() => {
  const loadExpenses = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    console.log(session)

    if (session) {
      fetchExpenses()
    } else {
      window.location.href = '/login'
    }
  }

  loadExpenses()
}, [])

  const handleSubmit = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      alert('Please login first')
      return
    }
	
	
	

const {
  data: { user: currentUser },
} = await supabase.auth.getUser()

if (!currentUser) return

const { error } = await supabase
  .from('expenses')
  .insert([
    {
      title,
      amount: Number(amount),
      category,
      user_id: currentUser.id,
    },
  ])

if (error) {
  console.log(error)
  return
}

setTitle('')
setAmount('')
setCategory('')

fetchExpenses()
	
	
	

    if (error) {
      alert(error.message)
    } else {
      alert('Expense added')

      setTitle('')
      setAmount('')
      setCategory('')
	  fetchExpenses()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-4">
        <div className="mb-6 flex items-center justify-between">
  <h1 className="text-3xl font-bold">
    Expense Tracker
  </h1>

  <button
    onClick={async () => {
      await supabase.auth.signOut()
      window.location.href = '/login'
    }}
    className="rounded bg-gray-800 px-4 py-2 text-white"
  >
    Logout
  </button>
</div>

<div className="mb-8 grid grid-cols-2 gap-4">
  <div className="rounded border p-4 shadow-sm">
    <p className="text-sm text-gray-500">
      Total Spent
    </p>

    <p className="text-2xl font-bold">
      ${totalAmount}
    </p>
  </div>

  <div className="rounded border p-4 shadow-sm">
    <p className="text-sm text-gray-500">
      Total Entries
    </p>

    <p className="text-2xl font-bold">
      {expenses.length}
    </p>
  </div>
</div>

        <input
          className="w-full rounded border p-2"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          className="w-full rounded border p-2"
          placeholder="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <input
          className="w-full rounded border p-2"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          className="w-full rounded bg-black p-2 text-white"
        >
          Add Expense
        </button>
<div className="mt-10">
  <h2 className="mb-4 text-2xl font-semibold">
    Expenses
  </h2>

  <div className="space-y-3">
    {expenses.map((expense) => (
      <div
        key={expense.id}
        className="rounded border p-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">
              {expense.title}
            </p>

            <p className="text-sm text-gray-500">
              {expense.category}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <p className="font-bold">
              ${expense.amount}
            </p>

            <button
              onClick={async () => {
                await supabase
                  .from('expenses')
                  .delete()
                  .eq('id', expense.id)

                fetchExpenses()
              }}
              className="rounded bg-red-500 px-3 py-1 text-white"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>		
      </div>
    </div>
  )
}