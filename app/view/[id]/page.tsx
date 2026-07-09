import { createClient } from '@supabase/supabase-js'
import ARViewer from '@/components/ARViewer'

async function getProject(id: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )

  const { data } = await supabase
    .from('projects')
    .select('title, file_url, file_type')
    .eq('id', id)
    .single()

  return data
}

export default async function ViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await getProject(id)

  if (!project) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">
        Dish not found.
      </div>
    )
  }

  return <ARViewer modelUrl={project.file_url} title={project.title} />
}