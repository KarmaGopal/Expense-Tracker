'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')

  const handleLogin = async () => {
    await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo:
          process.env.NODE_ENV === 'development'
            ? 'http://localhost:3000'
            : 'https://expense-tracker-dftx-75mc4w9fd-karmagopals-projects.vercel.app',
      },
    })

    alert('Check your email for login link')
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">Login</h1>

        <input
          type="email"
          placeholder="Enter email"
          className="w-full rounded border p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full rounded bg-black p-2 text-white"
        >
          Send Magic Link
        </button>
      </div>
    </div>
  )
}