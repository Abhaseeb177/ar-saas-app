'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export type Category = {
  id: string
  name: string
  sort_order: number
}

export default function CategoryManager({
  categories,
  onChange,
}: {
  categories: Category[]
  onChange: (categories: Category[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const addCategory = async () => {
    if (!newName.trim()) return
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('categories')
      .insert({ user_id: user.id, name: newName.trim(), sort_order: categories.length })
      .select()
      .single()

    if (!error && data) {
      onChange([...categories, data])
      setNewName('')
    }
  }

  const saveEdit = async (id: string) => {
    if (!editingName.trim()) return
    const supabase = createClient()
    const { error } = await supabase
      .from('categories')
      .update({ name: editingName.trim() })
      .eq('id', id)

    if (!error) {
      onChange(categories.map((c) => (c.id === id ? { ...c, name: editingName.trim() } : c)))
      setEditingId(null)
    }
  }

  const deleteCategory = async (id: string) => {
    if (!confirm('Delete this category? Dishes inside it will become uncategorized.')) return
    const supabase = createClient()
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (!error) {
      onChange(categories.filter((c) => c.id !== id))
    }
  }

  return (
    <div className="mb-8">
      <button
        onClick={() => setOpen(!open)}
        className="text-sm text-orange-400 hover:text-orange-300 font-medium"
      >
        {open ? '− Hide category manager' : '+ Manage categories'}
      </button>

      {open && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 mt-3">
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="e.g. Breakfast, Kids, Wine"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCategory()}
              className="flex-1 px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-sm focus:outline-none focus:border-orange-500"
            />
            <button
              onClick={addCategory}
              className="bg-orange-500 hover:bg-orange-400 text-black text-sm font-semibold px-4 rounded-lg transition"
            >
              Add
            </button>
          </div>

          {categories.length === 0 ? (
            <p className="text-neutral-500 text-sm">No categories yet. Add one above.</p>
          ) : (
            <div className="space-y-2">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2">
                  {editingId === cat.id ? (
                    <>
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit(cat.id)}
                        className="flex-1 bg-transparent text-white text-sm focus:outline-none"
                        autoFocus
                      />
                      <button onClick={() => saveEdit(cat.id)} className="text-green-400 text-xs font-semibold">Save</button>
                      <button onClick={() => setEditingId(null)} className="text-neutral-500 text-xs">Cancel</button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-white text-sm">{cat.name}</span>
                      <button
                        onClick={() => { setEditingId(cat.id); setEditingName(cat.name) }}
                        className="text-neutral-400 hover:text-white text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteCategory(cat.id)}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}