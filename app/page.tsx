'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export default function HomePage() {
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [expenses, setExpenses] = useState<any[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [aiInsights, setAiInsights] = useState('')
  const [loadingInsights, setLoadingInsights] = useState(false)
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

  if (editingId) {
    const { error } = await supabase
      .from('expenses')
      .update({
        title,
        amount: Number(amount),
        category,
      })
      .eq('id', editingId)

    if (error) {
      alert(error.message)
      return
    }

    alert('Expense updated')

    setEditingId(null)
  } else {
    const { error } = await supabase
      .from('expenses')
      .insert([
        {
          title,
          amount: Number(amount),
          category,
          user_id: user.id,
        },
      ])

    if (error) {
      alert(error.message)
      return
    }

    alert('Expense added')
  }

  setTitle('')
  setAmount('')
  setCategory('')

  fetchExpenses()
}

const categoryTotals = expenses.reduce(
  (acc: any, expense: any) => {
    const existing = acc.find(
      (item: any) => item.name === expense.category
    )

    if (existing) {
      existing.value += Number(expense.amount)
    } else {
      acc.push({
        name: expense.category,
        value: Number(expense.amount),
      })
    }

    return acc
  },
  []
)


const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#FF6384',
]


const generateInsights = async () => {
  setLoadingInsights(true)

  try {
    const response = await fetch(
      'http://localhost:5678/webhook/expense-summary',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expenses }),
      }
    )

    const data = await response.json()

   setAiInsights(data.output[0].content[0].text)
   
  } catch (error) {
    console.log(error)
    alert('Failed to generate insights')
  }

  setLoadingInsights(false)
}

const handleLogout = async () => {
  await supabase.auth.signOut()
  window.location.href = '/login'
}

return (
  <div className="flex min-h-screen items-center justify-center">
    <div className="w-full max-w-md space-y-4">
	
 <div className="rounded border p-4 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">
          Expenses by Category
        </h2>

  <div className="h-80">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={categoryTotals}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={100}
          dataKey="value"
          label={({ name, percent }) =>
            `${name} ${((percent || 0) * 100).toFixed(0)}%`
          }
        >
          {categoryTotals.map(
            (entry: any, index: number) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  COLORS[index % COLORS.length]
                }
              />
            )
          )}
        </Pie>

        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>
</div>


<button
  onClick={generateInsights}
  className="w-full rounded bg-purple-600 p-2 text-white"
>
  {loadingInsights
    ? 'Generating Insights...'
    : 'Generate AI Insights'}
</button>

{aiInsights && (
  <div className="rounded border p-4 shadow-sm">
    <h2 className="mb-2 text-xl font-semibold">
      AI Insights
    </h2>

    <pre className="whitespace-pre-wrap">
      {aiInsights}
    </pre>
  </div>
)}



<div className="mb-6 flex items-center justify-between">
  <h1 className="text-3xl font-bold">
    Expense Tracker
  </h1>

  <button
    onClick={handleLogout}
    className="rounded bg-red-500 px-4 py-2 text-white"
  >
    Logout
  </button>
</div>

<div className="mb-8 grid grid-cols-2 gap-4">


  <div className="rounded border p-4 shadow-sm">
    <p className="text-sm text-gray-500">
      Total Entries
    </p>

    <p className="text-2xl font-bold">
      {expenses.length}
    </p>
  </div>
</div>

  <div className="rounded border p-4 shadow-sm">
    <p className="text-sm text-gray-500">
      Total Spent
    </p>

    <p className="text-2xl font-bold">
      ${totalAmount}
    </p>
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

<select
  className="w-full rounded border p-2"
  value={category}
  onChange={(e) => setCategory(e.target.value)}
>
  <option value="">Select Category</option>
  <option value="Food">Food</option>
  <option value="Travel">Travel</option>
  <option value="Shopping">Shopping</option>
  <option value="Bills">Bills</option>
  <option value="Entertainment">Entertainment</option>
  <option value="Health">Health</option>
  <option value="Other">Other</option>
</select>

        <button
          onClick={handleSubmit}
          className="w-full rounded bg-black p-2 text-white"
        >
          {editingId ? 'Update Expense' : 'Add Expense'}
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
  onClick={() => {
    setEditingId(expense.id)
    setTitle(expense.title)
    setAmount(String(expense.amount))
    setCategory(expense.category)
  }}
  className="rounded bg-blue-500 px-3 py-1 text-white"
>
  Edit
</button>

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