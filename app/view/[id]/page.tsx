import { createClient } from '@supabase/supabase-js'
import ARViewer from '@/components/ARViewer'

async function getProject(id: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )

  const { data } = await supabase
    .from('projects')
    .select('title, description, file_url, file_type, price, phone_number, model_scale')
    .eq('id', id)
    .single()

  return data
}

export default async function ViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await getProject(id)

  if (!project) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-black">
        Dish not found.
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
      phoneNumber={project.phone_number || '+971564651875'}
      modelScale={project.model_scale || 1}
    />
  )
}