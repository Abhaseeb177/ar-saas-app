'use client'

import { useEffect } from 'react'
import '@google/model-viewer'

const ModelViewer = 'model-viewer' as unknown as React.FC<{
  src: string
  alt: string
  ar?: boolean
  'ar-modes'?: string
  'camera-controls'?: boolean
  'auto-rotate'?: boolean
    'shadow-intensity'?: string
    exposure?: string
    'field-of-view'?: string
    'camera-orbit'?: string
    'interaction-prompt'?: string
    'ar-scale'?: string
    scale?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}>

export default function ARViewer({
  modelUrl,
  title,
  description,
  price,
  restaurantName,
  phoneNumber,
  modelScale,
}: {
  modelUrl: string
  title: string
  description: string | null
  price: number | null
  restaurantName: string
  phoneNumber: string
  modelScale: number
}) {
  const scaleValue = `${modelScale} ${modelScale} ${modelScale}`
  useEffect(() => {
    document.body.style.margin = '0'
    document.body.style.backgroundColor = '#ffffff'
  }, [])

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="border-b border-neutral-200 py-5 px-6 text-center">
        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
          {restaurantName}
        </h1>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-5 py-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <h2 className="text-2xl sm:text-3xl font-black uppercase text-black leading-tight">
            {title}
          </h2>
          {price !== null && (
            <span className="text-2xl sm:text-3xl font-black text-black whitespace-nowrap">
              {price} <span className="text-sm font-bold text-neutral-500">AED</span>
            </span>
          )}
        </div>

        {description && (
          <p className="text-neutral-600 text-sm mb-6 leading-relaxed">{description}</p>
        )}

        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 overflow-hidden mb-4">
          <ModelViewer
            src={modelUrl}
            alt={title}
            ar
            ar-modes="scene-viewer webxr quick-look"
            camera-controls
            shadow-intensity="1"
            exposure="1"
            field-of-view="30deg"
            camera-orbit="0deg 75deg 105%"
            interaction-prompt="none"
            ar-scale="auto"
            scale={scaleValue}
            style={{
              width: '100%',
              height: '420px',
              backgroundColor: 'transparent',
              touchAction: 'none',
            }}
          />
        </div>

        <p className="text-center text-neutral-500 text-sm mb-10">
          Drag to rotate, or tap the AR icon in the viewer to place it on your table.
        </p>

        <a href={'tel:' + phoneNumber} className="flex items-center justify-center gap-2 w-full bg-black hover:bg-neutral-800 text-white font-bold uppercase tracking-wide py-4 rounded-full transition">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          <span>Order Now</span>
        </a>
      </main>
    </div>
  )
}