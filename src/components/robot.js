class Robot extends HTMLElement {

  constructor() {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    this.render()
    init3D(this.shadow.querySelector('.example'))
  }

  render() {

    this.shadow.innerHTML =
    /*html*/`
    <style>
      .example{
        width:100%;
        height:400px;
      }


    </style>

    <div class="example">
    </div>


    `

  }
}

customElements.define('robot-component', Robot);
