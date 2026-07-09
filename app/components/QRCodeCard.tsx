'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

export default function QRCodeCard({ projectId, title }: { projectId: string; title: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [viewUrl, setViewUrl] = useState('')

  useEffect(() => {
    const url = `${window.location.origin}/view/${projectId}`
    setViewUrl(url)

    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
    }
  }, [projectId])

  const handleDownload = () => {
    if (!canvasRef.current) return
    const link = document.createElement('a')
    link.download = `${title.replace(/\s+/g, '-').toLowerCase()}-qr.png`
    link.href = canvasRef.current.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col items-center text-center">
      <canvas ref={canvasRef} className="rounded-lg bg-white p-2" />
      <p className="text-white font-medium mt-4">{title}</p>
      <p className="text-neutral-500 text-xs mt-1 break-all px-2">{viewUrl}</p>
      <button
        onClick={handleDownload}
        className="mt-4 w-full bg-white text-black text-sm font-semibold py-2 rounded-full hover:bg-neutral-200 transition"
      >
        Download QR Code
      </button>
    </div>
  )
}