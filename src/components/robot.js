import {
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  Color,
  AmbientLight,
  DirectionalLight
} from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

class Robot extends HTMLElement {
  constructor() {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    this.render()
    this.init3D()
  }

  disconnectedCallback() {
    clearTimeout(this.touchResetTimer)
    this.resizeObserver?.disconnect()
    this.renderer?.setAnimationLoop(null)
    this.renderer?.dispose()
  }

  async init3D() {
    const viewer = this.shadow.querySelector('.eve')
    const aspect = viewer.clientWidth / viewer.clientHeight

    this.scene = new Scene()
    this.scene.background = new Color('#e8edf3')

    this.camera = new PerspectiveCamera(45, aspect, 0.1, 100)
    this.camera.position.set(0, 0.25, 4.5)
    this.camera.lookAt(0, 0.25, 0)

    const ambientLight = new AmbientLight(0xffffff, 1.5)
    this.scene.add(ambientLight)

    const keyLight = new DirectionalLight(0xffffff, 2)
    keyLight.position.set(3, 5, 6)
    this.scene.add(keyLight)

    const loader = new GLTFLoader()
    const gltf = await loader.loadAsync('/models/portfolio-companion.glb')

    this.model = gltf.scene
    this.scene.add(this.model)

    this.renderer = new WebGLRenderer({ antialias: true })
    this.renderer.setSize(viewer.clientWidth, viewer.clientHeight)
    viewer.appendChild(this.renderer.domElement)

    this.resizeObserver = new ResizeObserver(() => {
      const width = viewer.clientWidth
      const height = viewer.clientHeight

      if (width === 0 || height === 0) return

      this.camera.aspect = width / height
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(width, height)
    })

    this.resizeObserver.observe(viewer)

    this.head = this.model.getObjectByName('HeadPivot')

    let targetX = 0
    let targetY = 0

    const updateHeadTarget = (event) => {
      const rect = viewer.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      const y = ((event.clientY - rect.top) / rect.height) * 2 - 1

      targetX = y * 0.2
      targetY = x * 0.35
    }

    viewer.addEventListener('pointermove', updateHeadTarget)

    viewer.addEventListener('pointerdown', (event) => {
      updateHeadTarget(event)

      if (event.pointerType !== 'mouse') {
        clearTimeout(this.touchResetTimer)

        this.touchResetTimer = setTimeout(() => {
          targetX = 0
          targetY = 0
        }, 1200)
      }
    })

    viewer.addEventListener('pointerleave', (event) => {
      if (event.pointerType === 'mouse') {
        targetX = 0
        targetY = 0
      }
    })

    const baseY = this.model.position.y

    this.renderer.setAnimationLoop(() => {
      const time = performance.now() * 0.001

      this.model.position.y = baseY + Math.sin(time * 1.5) * 0.05

      this.head.rotation.x += (targetX - this.head.rotation.x) * 0.08
      this.head.rotation.y += (targetY - this.head.rotation.y) * 0.08

      this.renderer.render(this.scene, this.camera)
    })
  }

  render() {
    this.shadow.innerHTML = /*html*/`
      <style>
        :host {
          display: block;
          width: 100%;
        }

        .eve {
          width: 100%;
          height: 50vh;
        }

        @media (max-width: 600px) {
          .eve {
            height: 65vh;
          }
        }
      </style>

      <div class="eve"></div>
    `
  }
}

customElements.define('robot-component', Robot)