import { createClient } from '@supabase/supabase-js'
import ARViewer from '@/components/ARViewer'

async function getProjectAndLogScan(id: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )

  const { data } = await supabase
    .from('projects')
    .select('title, description, file_url, file_type, price, phone_number, model_scale')
    .eq('id', id)
    .single()

  if (data) {
    // Log this scan (fire and forget — don't block the page on this)
    supabase.from('scans').insert({ project_id: id }).then()
  }

  return data
}

export default async function ViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await getProjectAndLogScan(id)

  if (!project) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center px-6">
        <span className="text-5xl mb-4">🍽️</span>
        <h1 className="text-xl font-bold text-black mb-2">Dish not found</h1>
        <p className="text-neutral-500 text-sm">
          This QR code may be outdated, or the dish is no longer available.
        </p>
      </div>
    )
  }

  return (
    <ARViewer
      modelUrl={project.file_url}
      title={project.title}
      description={project.description}
      price={project.price}
      restaurantName="FIVE ▶ JUMEIRAH VILLAGE"
      phoneNumber={project.phone_number || '+971581009771'}
      modelScale={project.model_scale || 1}
    />
  )
}