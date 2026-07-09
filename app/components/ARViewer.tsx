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
  style?: React.CSSProperties
  children?: React.ReactNode
}>

export default function ARViewer({ modelUrl, title }: { modelUrl: string; title: string }) {
  useEffect(() => {
    document.body.style.margin = '0'
  }, [])

  return (
    <div className="relative w-screen h-screen bg-neutral-950 overflow-hidden">
      <ModelViewer
        src={modelUrl}
        alt={title}
        ar
        ar-modes="scene-viewer webxr quick-look"
        camera-controls
        auto-rotate
        shadow-intensity="1"
        exposure="1"
        style={{ width: '100%', height: '100%', backgroundColor: '#0a0a0a' }}
      >
        <button
          slot="ar-button"
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#f97316',
            color: 'black',
            fontWeight: 600,
            border: 'none',
            borderRadius: '9999px',
            padding: '12px 28px',
            fontSize: '15px',
            cursor: 'pointer',
          }}
        >
          👁️ View in your space
        </button>
      </ModelViewer>

      <div className="absolute top-0 left-0 right-0 p-5 bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
        <p className="text-white font-semibold text-lg">{title}</p>
      </div>
    </div>
  )
}