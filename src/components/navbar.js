import logoUrl from '../../img/logo.png'

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
      /*html*/
      `
      <style>
        :host {
          display: block;
          width: 100%;
        }

        nav {
          padding: 24px;
        }

        .links {
          max-width: 1200px;
          margin: 0 auto;
        }

        .logo img {
          display: block;
          width: 100%;
          max-width: 900px;
          height: auto;
        }

        ul {
          display: flex;
          flex-wrap: wrap;
          gap: 12px 24px;
          list-style: none;
          padding: 0;
          margin: 20px 0 0;
        }

        a {
          color: #111318;
          font: 500 16px Arial, sans-serif;
          text-decoration: none;
        }

        a:hover {
          color: #365fc9;
        }

        @media (max-width: 600px) {
          nav {
            padding: 16px;
          }

          .logo img {
            width: min(72vw, 280px);
          }

          ul {
            gap: 10px 18px;
            margin-top: 16px;
          }

          a {
            font-size: 14px;
          }
        }
      </style>

      <nav>
        <div class="links">
          <div class="logo">
            <img src="${logoUrl}" alt="Jose Llobera" />
          </div>

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

customElements.define('navbar-component', Navbar)