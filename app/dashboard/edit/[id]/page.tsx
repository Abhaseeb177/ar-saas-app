'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

export default function EditDishPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [newPhoto, setNewPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [newModel, setNewModel] = useState<File | null>(null)
  const [currentModelName, setCurrentModelName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('projects')
        .select('title, description, price, photo_url, file_url')
        .eq('id', id)
        .single()

      if (data) {
        setTitle(data.title || '')
        setDescription(data.description || '')
        setPrice(data.price !== null ? String(data.price) : '')
        setPhotoPreview(data.photo_url)
        setCurrentModelName(data.file_url?.split('/').pop() || 'current model')
      }
      setLoading(false)
    }
    load()
  }, [id])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      setNewPhoto(selected)
      setPhotoPreview(URL.createObjectURL(selected))
    }
  }

  const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      if (!selected.name.toLowerCase().endsWith('.glb')) {
        setError('Please upload a .glb 3D model file.')
        return
      }
      setError('')
      setNewModel(selected)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

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

    const updates: Record<string, unknown> = {
      title,
      description: description || null,
      price: price ? parseFloat(price) : null,
    }

    if (newModel) {
      const modelFileName = `${user.id}/${safeName}-${Date.now()}.glb`
      const { error: modelUploadError } = await supabase.storage
        .from('dish-models')
        .upload(modelFileName, newModel, { contentType: 'model/gltf-binary' })

      if (modelUploadError) {
        setError(modelUploadError.message)
        setSaving(false)
        return
      }
      const { data: modelUrlData } = supabase.storage
        .from('dish-models')
        .getPublicUrl(modelFileName)
      updates.file_url = modelUrlData.publicUrl
    }

    if (newPhoto) {
      const photoExt = newPhoto.name.split('.').pop()
      const photoFileName = `${user.id}/${safeName}-${Date.now()}.${photoExt}`
      const { error: photoUploadError } = await supabase.storage
        .from('dish-photos')
        .upload(photoFileName, newPhoto)

      if (!photoUploadError) {
        const { data: photoUrlData } = supabase.storage
          .from('dish-photos')
          .getPublicUrl(photoFileName)
        updates.photo_url = photoUrlData.publicUrl
      }
    }

    const { error: updateError } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)

    setSaving(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <p className="text-neutral-500">Loading dish...</p>
      </div>
    )
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

        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Edit Dish</h1>
        <p className="text-neutral-400 mb-8">
          Update the details below. Leave file uploads unchanged to keep the existing files.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-neutral-300 mb-2">Dish name</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-orange-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm text-neutral-300 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-orange-500 transition resize-none"
            />
          </div>

          <div>
            <label className="block text-sm text-neutral-300 mb-2">Price (AED)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-orange-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm text-neutral-300 mb-2">Dish photo</label>
            {photoPreview && (
              <img src={photoPreview} alt="Preview" className="w-full h-40 object-cover rounded-xl border border-neutral-800 mb-2" />
            )}
            <label className="flex items-center justify-center w-full py-3 rounded-xl border-2 border-dashed border-neutral-800 hover:border-neutral-600 cursor-pointer transition text-neutral-400 text-sm">
              {newPhoto ? newPhoto.name : 'Click to replace photo'}
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            </label>
          </div>

          <div>
            <label className="block text-sm text-neutral-300 mb-2">3D model (.glb)</label>
            <p className="text-neutral-500 text-xs mb-2">Current: {currentModelName}</p>
            <label className="flex items-center justify-center w-full py-3 rounded-xl border-2 border-dashed border-neutral-800 hover:border-neutral-600 cursor-pointer transition text-neutral-400 text-sm">
              {newModel ? newModel.name : 'Click to replace 3D model'}
              <input type="file" accept=".glb" onChange={handleModelChange} className="hidden" />
            </label>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-black font-semibold py-3 rounded-xl transition"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </main>
    </div>
  )
}