import { Renderer, Program, Mesh, Triangle } from 'ogl'
import { gsap } from 'gsap'

class WebGLCarousel {
  constructor() {
    this.wrapper = document.querySelector('[data-canvas-wrapper]')
  }

  init() {
    this._createRenderer()
    this._createScene()
    this._addListeners()
    this._onResize()

    gsap.ticker.add(() => {
      this.program.uniforms.uTime.value += 0.01
      this.renderer.render({ scene: this.mesh })
    })
  }

  _createRenderer() {
    this.renderer = new Renderer()
    this.gl = this.renderer.gl

    this.wrapper.appendChild(this.gl.canvas)

    this.gl.clearColor(1, 1, 1, 1)
  }

  _createScene() {
    this.geometry = new Triangle(this.gl)

    this.program = new Program(this.gl, {
      vertex: require('./shaders/effect.vertex.glsl'),
      fragment: require('./shaders/effect.fragment.glsl'),
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 }
      }
    })

    this.mesh = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program
    })
  }

  _addListeners() {
    window.addEventListener('resize', this._onResize.bind(this), { passive: true })
  }

  _onResize() {
    this.renderer.setSize(this.wrapper.clientWidth, this.wrapper.clientHeight)
  }
}

const app = new WebGLCarousel()
app.init()
