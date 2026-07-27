'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import QRCodeCard from '@/components/QRCodeCard'
import CategoryManager, { Category } from '@/components/CategoryManager'

type Project = {
  id: string
  title: string
  file_type: string | null
  qr_code_url: string | null
  created_at: string
  model_scale?: number
  photo_url?: string | null
  category_id?: string | null
}

type Profile = {
  email: string
  plan: string
  scan_limit: number
}
type ScanCount = {
  project_id: string
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [totalScans, setTotalScans] = useState(0)
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState<string | 'all'>('all')
  const [loading, setLoading] = useState(true)
  const [qrProject, setQrProject] = useState<Project | null>(null)
  useEffect(() => {
    const handlePopState = () => {
      setQrProject(null)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('email, plan, scan_limit')
        .eq('id', user.id)
        .single()

      const { data: projectsData } = await supabase
        .from('projects')
        .select('id, title, file_type, qr_code_url, created_at, model_scale, photo_url, category_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      const { data: categoriesData } = await supabase
        .from('categories')
        .select('id, name, sort_order')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true })

      setCategories(categoriesData || [])

      // Count total scans across all of this user's dishes
      let scanCount = 0
      if (projectsData && projectsData.length > 0) {
        const projectIds = projectsData.map((p) => p.id)
        const { count } = await supabase
          .from('scans')
          .select('*', { count: 'exact', head: true })
          .in('project_id', projectIds)
        scanCount = count || 0
      }

      setProfile(profileData)
      setProjects(projectsData || [])
      setTotalScans(scanCount)
      setLoading(false)
    }

    loadData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <p className="text-neutral-500">Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <Navbar email={profile?.email || ''} />

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Your Menu Items</h1>
            <p className="text-neutral-400 mt-1">
              Manage your AR dishes and their QR codes
            </p>
          </div>

          <button
            onClick={() => router.push('/dashboard/new')}
            className="bg-orange-500 hover:bg-orange-400 text-black font-semibold px-5 py-2.5 rounded-full transition shadow-lg shadow-orange-500/20 whitespace-nowrap"
          >
            + Add New Dish
          </button>
        </div>

        <CategoryManager categories={categories} onChange={setCategories} />

        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-1 px-1">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                activeCategory === 'all'
                  ? 'bg-orange-500 text-black'
                  : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                  activeCategory === cat.id
                    ? 'bg-orange-500 text-black'
                    : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Plan card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-neutral-400 text-sm">Current Plan</p>
            <p className="text-white font-semibold text-lg capitalize">
              {profile?.plan || 'free'}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-neutral-400 text-sm">Scans Used</p>
            <p className="text-white font-semibold text-lg">
              {totalScans} <span className="text-neutral-500 font-normal">/ {profile?.scan_limit ?? 100}</span>
            </p>
          </div>
          {profile?.plan === 'free' && (
            <button className="bg-white text-black text-sm font-semibold px-4 py-2 rounded-full hover:bg-neutral-200 transition">
              Upgrade to Premium
            </button>
          )}
        </div>

        {/* Projects grid */}
        {(() => {
          const filteredProjects = activeCategory === 'all'
            ? projects
            : projects.filter((p) => p.category_id === activeCategory)

          return filteredProjects.length === 0 ? (
          <div className="border border-dashed border-neutral-800 rounded-2xl py-20 text-center">
            <p className="text-5xl mb-4">🍔</p>
            <p className="text-white font-medium text-lg">No dishes yet</p>
            <p className="text-neutral-500 mt-1">
              Add your first AR dish to generate its QR code
            </p>
            <button
              onClick={() => router.push('/dashboard/new')}
              className="mt-6 bg-orange-500 hover:bg-orange-400 text-black font-semibold px-5 py-2.5 rounded-full transition"
            >
              + Add New Dish
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => {
                  window.history.pushState({ modal: true }, '')
                  setQrProject(project)
                }}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 hover:border-neutral-600 transition cursor-pointer"
              >
                <div className="w-full h-36 bg-neutral-800 rounded-xl flex items-center justify-center mb-4 overflow-hidden">
                  {project.photo_url ? (
                    <img
                      src={project.photo_url}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl">
                      {project.file_type === 'model' ? '🧊' : '🖼️'}
                    </span>
                  )}
                </div>
                <h3 className="text-white font-semibold truncate">{project.title}</h3>
                <p className="text-neutral-500 text-sm mt-1">
                  {new Date(project.created_at).toLocaleDateString()}
                </p>
                <p className="text-orange-400 text-xs mt-2">Tap to view QR code →</p>
              </div>
            ))}
          </div>
          )
        })()}
      </main>

      {qrProject && (
        <div
          onClick={() => window.history.back()}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-6"
        >
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm">
            <QRCodeCard projectId={qrProject.id} title={qrProject.title} />

            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 mt-4">
              <label className="block text-sm text-neutral-300 mb-2">
                AR Model Size: {(qrProject.model_scale ?? 1).toFixed(2)}x
              </label>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.05"
                value={qrProject.model_scale ?? 1}
                onChange={(e) => {
                  const newScale = parseFloat(e.target.value)
                  setQrProject({ ...qrProject, model_scale: newScale })
                }}
                className="w-full accent-orange-500"
              />
              <p className="text-neutral-500 text-xs mt-2">
                Adjust if the dish looks too big or too small on the real table in AR.
              </p>
              <button
                onClick={async () => {
                  const supabase = createClient()
                  await supabase
                    .from('projects')
                    .update({ model_scale: qrProject.model_scale ?? 1 })
                    .eq('id', qrProject.id)
                  setProjects(projects.map(p =>
                    p.id === qrProject.id ? { ...p, model_scale: qrProject.model_scale ?? 1 } : p
                  ))
                }}
                className="mt-3 w-full bg-orange-500 hover:bg-orange-400 text-black font-semibold text-sm py-2 rounded-full transition"
              >
                Save Size
              </button>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => router.push(`/dashboard/edit/${qrProject.id}`)}
                className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-semibold py-2.5 rounded-full transition"
              >
                Edit Dish
              </button>
              <button
                onClick={async () => {
                  if (!confirm(`Delete "${qrProject.title}"? This cannot be undone.`)) return
                  const supabase = createClient()
                  await supabase.from('projects').delete().eq('id', qrProject.id)
                  setProjects(projects.filter((p) => p.id !== qrProject.id))
                  window.history.back()
                }}
                className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-semibold py-2.5 rounded-full transition border border-red-500/30"
              >
                Delete
              </button>
            </div>
            <button
              onClick={() => window.history.back()}
              className="mt-3 w-full text-neutral-400 hover:text-white text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}