'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { friendlyError } from '@/lib/errors'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setMessage(friendlyError(error.message))
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0a0a0a',
    }}>
      <form onSubmit={handleLogin} style={{
        backgroundColor: '#1a1a1a',
        padding: '40px',
        borderRadius: '12px',
        width: '320px',
      }}>
        <h1 style={{ color: 'white', marginBottom: '20px', fontSize: '24px' }}>
          Log in
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '12px',
            borderRadius: '6px',
            border: '1px solid #333',
            backgroundColor: '#0a0a0a',
            color: 'white',
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '12px',
            borderRadius: '6px',
            border: '1px solid #333',
            backgroundColor: '#0a0a0a',
            color: 'white',
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: '#ffffff',
            color: 'black',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>

        {message && (
          <p style={{ color: '#ff6b6b', marginTop: '12px', fontSize: '14px' }}>
            {message}
          </p>
        )}

        <p style={{ color: '#666', marginTop: '16px', fontSize: '14px' }}>
          Don&apos;t have an account? <a href="/signup" style={{ color: 'white' }}>Sign up</a>
        </p>
      </form>
    </div>
  )
}