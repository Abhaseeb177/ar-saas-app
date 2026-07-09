'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

export default function NewDishPage() {
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      if (!selected.name.toLowerCase().endsWith('.glb')) {
        setError('Please upload a .glb 3D model file.')
        setFile(null)
        return
      }
      setError('')
      setFile(selected)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!file) {
      setError('Please choose a .glb 3D model file.')
      return
    }

    setUploading(true)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const safeName = title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const fileName = `${user.id}/${safeName}-${Date.now()}.glb`

    const { error: uploadError } = await supabase.storage
      .from('dish-models')
      .upload(fileName, file)

    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      return
    }

    const { data: publicUrlData } = supabase.storage
      .from('dish-models')
      .getPublicUrl(fileName)

    const { error: insertError } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        title,
        file_url: publicUrlData.publicUrl,
        file_type: 'model',
      })

    setUploading(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <Navbar email="" />

      <main className="max-w-xl mx-auto px-6 py-10">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-neutral-400 hover:text-white text-sm mb-6 inline-flex items-center gap-1"
        >
          ← Back to dashboard
        </button>

        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Add New Dish</h1>
        <p className="text-neutral-400 mb-2">
          Upload a 3D scan of your dish (.glb file) — scanned using an app like Polycam or KIRI Engine.
        </p>
        <p className="text-neutral-600 text-sm mb-8">
          Don&apos;t have one yet? Scan your dish from all angles using the free Polycam or KIRI Engine app, export as .glb, then upload it here.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-neutral-300 mb-2">Dish name</label>
            <input
              type="text"
              placeholder="e.g. Truffle Mushroom Risotto"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm text-neutral-300 mb-2">3D model file (.glb)</label>

            {file ? (
              <div className="flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🧊</span>
                  <span className="text-white text-sm truncate">{file.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-neutral-400 hover:text-white text-xs"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed border-neutral-800 hover:border-neutral-600 cursor-pointer transition">
                <span className="text-4xl mb-2">🧊</span>
                <span className="text-neutral-400 text-sm">Click to upload a .glb file</span>
                <span className="text-neutral-600 text-xs mt-1">Exported from Polycam, KIRI Engine, etc.</span>
                <input
                  type="file"
                  accept=".glb"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-black font-semibold py-3 rounded-xl transition"
          >
            {uploading ? 'Uploading...' : 'Create AR Experience'}
          </button>
        </form>
      </main>
    </div>
  )
}