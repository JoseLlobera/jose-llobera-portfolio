import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import {
  Group,
  Mesh,
  MeshStandardMaterial,
  Scene,
  SphereGeometry,
  TorusGeometry,
} from 'three'
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js'

// GLTFExporter uses the browser FileReader API. This small adapter lets it
// export an asset from Node without adding another dependency.
globalThis.FileReader ??= class FileReader {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((buffer) => {
      this.result = buffer
      this.onloadend?.()
    })
  }

  readAsDataURL(blob) {
    blob.arrayBuffer().then((buffer) => {
      this.result = `data:${blob.type};base64,${Buffer.from(buffer).toString('base64')}`
      this.onloadend?.()
    })
  }
}

const material = (color, options = {}) => new MeshStandardMaterial({
  color,
  metalness: 0.35,
  roughness: 0.32,
  ...options,
})

const headShell = material('#244675', { metalness: 0.45 })
const bodyShell = material('#183155', { metalness: 0.45 })
const cobalt = material('#2165dc', { metalness: 0.4 })
const visor = material('#0a172b', { roughness: 0.18 })
const glow = material('#86caff', {
  emissive: '#1269f7',
  emissiveIntensity: 1.5,
  metalness: 0.05,
})
const highlight = material('#d4eaff', { metalness: 0.15 })

function put(parent, name, geometry, finish, position, rotation) {
  const mesh = new Mesh(geometry, finish)
  mesh.name = name
  mesh.position.set(...position)
  if (rotation) mesh.rotation.set(...rotation)
  parent.add(mesh)
  return mesh
}

function ellipsoid(parent, name, radii, finish, position) {
  const mesh = put(parent, name, new SphereGeometry(1, 48, 32), finish, position)
  mesh.scale.set(...radii)
  return mesh
}

const scene = new Scene()
scene.name = 'CompanionScene'

const robot = new Group()
robot.name = 'PortfolioCompanion'
scene.add(robot)

const body = new Group()
body.name = 'BodyPivot'
body.position.y = -0.55
robot.add(body)

ellipsoid(body, 'BodyShell', [0.5, 0.54, 0.4], bodyShell, [0, 0, 0])
ellipsoid(body, 'ChestDisc', [0.22, 0.22, 0.07], visor, [0, 0.01, 0.37])
put(body, 'ChestRing', new TorusGeometry(0.17, 0.025, 10, 48), cobalt, [0, 0.01, 0.44])
ellipsoid(body, 'ChestCore', [0.07, 0.07, 0.035], glow, [0, 0.01, 0.46])
put(body, 'OrbitBand', new TorusGeometry(0.59, 0.026, 10, 64), cobalt, [0, -0.04, 0], [1.15, 0, 0.17])

put(robot, 'HoverRing', new TorusGeometry(0.34, 0.018, 8, 48), glow, [0, -1.24, 0], [Math.PI / 2, 0, 0])
ellipsoid(robot, 'HoverCore', [0.07, 0.045, 0.07], cobalt, [0, -1.14, 0])

const head = new Group()
head.name = 'HeadPivot'
head.position.y = 0.73
robot.add(head)

ellipsoid(head, 'HeadShell', [0.82, 0.64, 0.57], headShell, [0, 0, 0])
ellipsoid(head, 'FacePlate', [0.61, 0.34, 0.12], visor, [0, -0.015, 0.53])
const faceRim = put(head, 'FaceRim', new TorusGeometry(0.59, 0.018, 8, 64), cobalt, [0, -0.015, 0.53])
faceRim.scale.y = 0.57
put(head, 'HeadHalo', new TorusGeometry(0.79, 0.018, 8, 72), cobalt, [0, 0, -0.14], [0, 0, 0.16])

for (const side of [-1, 1]) {
  const label = side < 0 ? 'Left' : 'Right'
  const eye = new Group()
  eye.name = `${label}EyePivot`
  eye.position.set(side * 0.23, 0.01, 0.655)
  head.add(eye)
  ellipsoid(eye, `${label}Eye`, [0.095, 0.085, 0.025], glow, [0, 0, 0])
  ellipsoid(eye, `${label}EyeGlint`, [0.018, 0.018, 0.008], highlight, [-0.025, 0.025, 0.027])
}

const exporter = new GLTFExporter()
const glb = await exporter.parseAsync(scene, {
  binary: true,
  onlyVisible: true,
  copyright: 'Original procedural portfolio mascot. No third-party model or textures used.',
})
const output = resolve('public/models/portfolio-companion.glb')
await mkdir(resolve('public/models'), { recursive: true })
await writeFile(output, Buffer.from(glb))
console.log(`Created ${output} (${glb.byteLength} bytes)`)
