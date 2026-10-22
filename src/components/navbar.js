class Navbar extends HTMLElement {

  constructor() {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    this.render()
  }

  render() {
    this.shadow.innerHTML =
    /*html*/`
    <style>
    </style>

    <nav>
      <div class="links">
        <ul>
          <li><a href="#proyectos">Proyectos</a></li>
          <li><a href="#sobremi">Sobre mí</a></li>
          <li><a href="#servicios">Servicios</a></li>
          <li><a href="#contacto">Contacto</a></li>
        </ul>
      </div>
    </nav>
    `
  }
}

customElements.define('navbar-component', Navbar);
