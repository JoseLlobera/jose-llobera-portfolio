import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import {
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Scene,
  SphereGeometry,
  TorusGeometry,
} from 'three'
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

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
  roughness: 0.55,
  metalness: 0.12,
  ...options,
})

const shell = material('#d96952', { roughness: 0.42 })
const shellLight = material('#f19a70')
const navy = material('#19333d', { metalness: 0.3 })
const face = material('#10232c', { roughness: 0.3 })
const mint = material('#9de7cc', {
  emissive: '#3aa88b',
  emissiveIntensity: 0.65,
})
const warmWhite = material('#f5f2e8')

const rounded = (width, height, depth, radius) =>
  new RoundedBoxGeometry(width, height, depth, 5, radius)

function put(parent, name, geometry, finish, position, rotation) {
  const mesh = new Mesh(geometry, finish)
  mesh.name = name
  mesh.position.set(...position)
  if (rotation) mesh.rotation.set(...rotation)
  parent.add(mesh)
  return mesh
}

const scene = new Scene()
scene.name = 'CompanionScene'

const robot = new Group()
robot.name = 'PortfolioCompanion'
scene.add(robot)

const body = new Group()
body.name = 'BodyPivot'
body.position.y = -0.2
robot.add(body)

put(body, 'Torso', rounded(1.05, 1.02, 0.62, 0.2), navy, [0, 0, 0])
put(body, 'ChestPanel', rounded(0.66, 0.32, 0.07, 0.08), shell, [0, 0.09, 0.34])
put(body, 'ChestCore', new SphereGeometry(0.075, 16, 12), mint, [0, 0.09, 0.39])
put(body, 'Collar', rounded(0.48, 0.13, 0.43, 0.06), shellLight, [0, 0.55, 0])

for (const side of [-1, 1]) {
  const label = side < 0 ? 'Left' : 'Right'
  const arm = new Group()
  arm.name = `${label}ArmPivot`
  arm.position.set(side * 0.59, 0.27, 0)
  body.add(arm)
  put(arm, `${label}Shoulder`, new SphereGeometry(0.17, 20, 14), shell, [0, 0, 0])
  put(
    arm,
    `${label}Forearm`,
    rounded(0.24, 0.52, 0.28, 0.11),
    shell,
    [side * 0.07, -0.29, 0.02],
    [0, 0, side * 0.16],
  )
  put(arm, `${label}Hand`, new SphereGeometry(0.15, 20, 14), warmWhite, [side * 0.13, -0.58, 0.05])

  put(
    robot,
    `${label}Leg`,
    rounded(0.27, 0.36, 0.34, 0.09),
    navy,
    [side * 0.25, -0.91, 0],
  )
  put(
    robot,
    `${label}Foot`,
    rounded(0.37, 0.14, 0.49, 0.06),
    shellLight,
    [side * 0.25, -1.1, 0.1],
  )
}

const head = new Group()
head.name = 'HeadPivot'
head.position.y = 1.03
robot.add(head)

put(head, 'HeadShell', rounded(1.5, 0.89, 0.82, 0.23), shell, [0, 0, 0])
put(head, 'FacePlate', rounded(1.19, 0.61, 0.07, 0.16), face, [0, -0.02, 0.43])
put(head, 'ForeheadAccent', rounded(0.35, 0.055, 0.035, 0.025), shellLight, [0, 0.29, 0.45])

for (const side of [-1, 1]) {
  const label = side < 0 ? 'Left' : 'Right'
  const eye = new Group()
  eye.name = `${label}EyePivot`
  eye.position.set(side * 0.32, 0.03, 0.49)
  head.add(eye)
  put(eye, `${label}EyeRim`, new TorusGeometry(0.135, 0.023, 8, 28), shellLight, [0, 0, 0])
  put(eye, `${label}Eye`, new SphereGeometry(0.095, 24, 16), mint, [0, 0, 0.045])
  put(eye, `${label}EyeGlint`, new SphereGeometry(0.025, 12, 8), warmWhite, [-0.03, 0.03, 0.125])
  put(
    head,
    `${label}Ear`,
    new CylinderGeometry(0.17, 0.17, 0.11, 24),
    navy,
    [side * 0.79, 0.0, 0],
    [0, 0, Math.PI / 2],
  )
}

put(head, 'Smile', new TorusGeometry(0.115, 0.013, 8, 24, Math.PI), mint, [0, -0.18, 0.485], [0, 0, Math.PI])

const antenna = new Group()
antenna.name = 'Antenna'
antenna.position.set(0.43, 0.45, -0.03)
head.add(antenna)
put(antenna, 'AntennaStem', new CylinderGeometry(0.035, 0.055, 0.34, 12), navy, [0.05, 0.17, 0], [0, 0, -0.3])
put(antenna, 'AntennaTip', new SphereGeometry(0.105, 20, 14), mint, [0.1, 0.35, 0])

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
