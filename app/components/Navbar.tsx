'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function Navbar({ email }: { email: string }) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="w-full border-b border-neutral-800 bg-neutral-950/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 hover:opacity-80 transition"
        >
          <span className="text-2xl">🍽️</span>
          <span className="text-white font-bold text-lg tracking-tight">
            Menu<span className="text-orange-500">AR</span>
          </span>
        </button>

        <div className="flex items-center gap-4">
          <span className="text-neutral-400 text-sm hidden sm:block">{email}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-neutral-300 hover:text-white border border-neutral-700 hover:border-neutral-500 px-4 py-1.5 rounded-full transition"
          >
            Log out
          </button>
        </div>
      </div>
    </nav>
  )
}