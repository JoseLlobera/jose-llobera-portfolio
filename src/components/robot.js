import { PerspectiveCamera, Scene, WebGLRenderer, Color } from 'three'

class Robot extends HTMLElement {

  constructor() {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    this.render()
    this.init3D()
  }

  init3D() {
    this.scene = new Scene()

    const viewer = this.shadow.querySelector('.eve')
    const aspect = viewer.clientWidth / viewer.clientHeight
    this.camera = new PerspectiveCamera(45, aspect, 0.1, 100)
    this.camera.position.z = 3

    this.scene.background = new Color('#e8edf3')

    this.renderer = new WebGLRenderer({ antialias: true })
    this.renderer.setSize(viewer.clientWidth, viewer.clientHeight)
    viewer.appendChild(this.renderer.domElement)
    this.renderer.render(this.scene, this.camera)
  }

  render() {

    this.shadow.innerHTML =
    /*html*/`
    <style>
      .eve{
        width:100%;
        height:50vh;
      }

      :host {
        display: block;
      }

    </style>

    <div class="eve">
    </div>

    `


  }
}

customElements.define('robot-component', Robot);
