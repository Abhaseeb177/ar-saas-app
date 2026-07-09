'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Success! Check your email to confirm your account, then log in.')
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
      <form onSubmit={handleSignUp} style={{
        backgroundColor: '#1a1a1a',
        padding: '40px',
        borderRadius: '12px',
        width: '320px',
      }}>
        <h1 style={{ color: 'white', marginBottom: '20px', fontSize: '24px' }}>
          Create your account
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
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
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
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>

        {message && (
          <p style={{ color: '#aaa', marginTop: '12px', fontSize: '14px' }}>
            {message}
          </p>
        )}

        <p style={{ color: '#666', marginTop: '16px', fontSize: '14px' }}>
          Already have an account? <a href="/login" style={{ color: 'white' }}>Log in</a>
        </p>
      </form>
    </div>
  )
}