'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function HomePage() {
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')

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
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-3xl font-bold">Expense Tracker</h1>

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
    </div>
  )
}