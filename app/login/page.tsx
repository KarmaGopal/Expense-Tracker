'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Expense = {
  id: string
  title: string
  amount: number
  category: string
}

export default function HomePage() {
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [expenses, setExpenses] = useState<Expense[]>([])

const fetchExpenses = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.log('No user found')
    return
  }

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.log(error)
  } else {
    setExpenses(data)
  }
}

  useEffect(() => {
    fetchExpenses()
  }, [])

  const handleSubmit = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      alert('Please login first')
      return
    }

    const { error } = await supabase.from('expenses').insert({
      title,
      amount: Number(amount),
      category,
      user_id: user.id,
    })

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
const totalAmount = expenses.reduce(
  (sum, expense) => sum + expense.amount,
  0
)
  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="mb-6 text-3xl font-bold">
        Expense Tracker
      </h1>
	  
	  <div className="mb-6 grid grid-cols-2 gap-4">
  <div className="rounded border p-4">
    <p className="text-sm text-gray-500">
      Total Expenses
    </p>

    <p className="text-2xl font-bold">
      ${totalAmount}
    </p>
  </div>

  <div className="rounded border p-4">
    <p className="text-sm text-gray-500">
      Total Entries
    </p>

    <p className="text-2xl font-bold">
      {expenses.length}
    </p>
  </div>
</div>
	  
	  
	  
	  

      <div className="space-y-4">
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
      </div>

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
  )
}