import * as THREE from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'

export async function generatePhotoCardGLB(imageFile: File): Promise<Blob> {
  const imageUrl = URL.createObjectURL(imageFile)

  const texture = await new THREE.TextureLoader().loadAsync(imageUrl)
  texture.colorSpace = THREE.SRGBColorSpace

  const img = texture.image as HTMLImageElement
  const aspect = img.width / img.height
  const height = 0.2
  const width = height * aspect

  const geometry = new THREE.PlaneGeometry(width, height)
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide,
  })
  const mesh = new THREE.Mesh(geometry, material)

  const scene = new THREE.Scene()
  scene.add(mesh)

  const exporter = new GLTFExporter()

  return new Promise((resolve, reject) => {
    exporter.parse(
      scene,
      (result) => {
        URL.revokeObjectURL(imageUrl)
        if (result instanceof ArrayBuffer) {
          resolve(new Blob([result], { type: 'model/gltf-binary' }))
        } else {
          reject(new Error('Unexpected export format'))
        }
      },
      (error) => reject(error),
      { binary: true }
    )
  })
}