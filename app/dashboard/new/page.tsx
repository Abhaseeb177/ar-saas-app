'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { generatePhotoCardGLB } from '@/lib/generatePhotoCard'
import { friendlyError } from '@/lib/errors'
import Navbar from '@/components/Navbar'

export default function NewDishPage() {
  useEffect(() => {
    const loadCategories = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('categories')
        .select('id, name')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true })
      setCategories(data || [])
    }
    loadCategories()
  }, [])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [modelFile, setModelFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      setPhoto(selected)
      setPhotoPreview(URL.createObjectURL(selected))
    }
  }

  const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      if (!selected.name.toLowerCase().endsWith('.glb')) {
        setError('Please upload a .glb 3D model file.')
        setModelFile(null)
        return
      }
      setError('')
      setModelFile(selected)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!modelFile && !photo) {
      setError('Please upload either a .glb 3D model or a dish photo.')
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

    // 1. Get the actual .glb — either the uploaded scan, or an auto-generated photo card
    let modelBlob: File | Blob = modelFile as File
    let generatedFromPhoto = false

    if (!modelFile && photo) {
      try {
        modelBlob = await generatePhotoCardGLB(photo)
        generatedFromPhoto = true
      } catch {
        setError('Could not process that photo. Please try a different image.')
        setUploading(false)
        return
      }
    }

    const modelFileName = `${user.id}/${safeName}-${Date.now()}.glb`
    const { error: modelUploadError } = await supabase.storage
      .from('dish-models')
      .upload(modelFileName, modelBlob, {
        contentType: 'model/gltf-binary',
      })

    if (modelUploadError) {
      setError(friendlyError(modelUploadError.message))
      setUploading(false)
      return
    }

    const { data: modelUrlData } = supabase.storage
      .from('dish-models')
      .getPublicUrl(modelFileName)

    // 2. Upload the photo, if provided
    let photoUrl: string | null = null
    if (photo) {
      const photoExt = photo.name.split('.').pop()
      const photoFileName = `${user.id}/${safeName}-${Date.now()}.${photoExt}`

      const { error: photoUploadError } = await supabase.storage
        .from('dish-photos')
        .upload(photoFileName, photo)

      if (!photoUploadError) {
        const { data: photoUrlData } = supabase.storage
          .from('dish-photos')
          .getPublicUrl(photoFileName)
        photoUrl = photoUrlData.publicUrl
      }
    }

    // 3. Save everything to the database
    const { error: insertError } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        title,
        description: description || null,
        price: price ? parseFloat(price) : null,
        file_url: modelUrlData.publicUrl,
        photo_url: photoUrl,
        file_type: generatedFromPhoto ? 'photo-card' : 'model',
        category_id: categoryId || null,
      })

    setUploading(false)

    if (insertError) {
      setError(friendlyError(insertError.message))
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
        <p className="text-neutral-400 mb-8">
          Fill in the details and upload a 3D scan (.glb) to create the AR experience.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dish name */}
          <div>
            <label className="block text-sm text-neutral-300 mb-2">Dish name</label>
            <input
              type="text"
              placeholder="e.g. English Breakfast"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500 transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-neutral-300 mb-2">Description</label>
            <textarea
              placeholder="e.g. Eggs any style, grilled chicken sausage, beef bacon, roasted tomato, hash browns"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500 transition resize-none"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm text-neutral-300 mb-2">Price (AED) — optional</label>
            <input
              type="number"
              placeholder="e.g. 138"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500 transition"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm text-neutral-300 mb-2">Category — optional</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-orange-500 transition"
            >
              <option value="">No category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Photo upload */}
          <div>
            <label className="block text-sm text-neutral-300 mb-2">Dish photo — optional</label>

            {photoPreview ? (
              <div className="relative">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-xl border border-neutral-800"
                />
                <button
                  type="button"
                  onClick={() => { setPhoto(null); setPhotoPreview(null) }}
                  className="absolute top-3 right-3 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full hover:bg-black transition"
                >
                  Change photo
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-neutral-800 hover:border-neutral-600 cursor-pointer transition">
                <span className="text-3xl mb-1">📸</span>
                <span className="text-neutral-400 text-sm">Click to upload a photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* 3D model upload */}
          <div>
            <label className="block text-sm text-neutral-300 mb-2">
              3D model file (.glb) — optional
            </label>
            <p className="text-neutral-500 text-xs mb-2">
              If you skip this, we & apos;ll automatically create a floating photo card from your dish photo instead.
            </p>

            {modelFile ? (
              <div className="flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🧊</span>
                  <span className="text-white text-sm truncate">{modelFile.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setModelFile(null)}
                  className="text-neutral-400 hover:text-white text-xs"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-neutral-800 hover:border-neutral-600 cursor-pointer transition">
                <span className="text-3xl mb-1">🧊</span>
                <span className="text-neutral-400 text-sm">Click to upload a .glb file</span>
                <input
                  type="file"
                  accept=".glb"
                  onChange={handleModelChange}
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