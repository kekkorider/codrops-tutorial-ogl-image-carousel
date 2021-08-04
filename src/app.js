import { Renderer, Program, Mesh, Triangle, Vec2 } from 'ogl'
import { gsap } from 'gsap'
import { Pane } from 'tweakpane'

class WebGLCarousel {
  constructor() {
    this.wrapper = document.querySelector('[data-canvas-wrapper]')
  }

  init() {
    this._createRenderer()
    this._createScene()
    this._createDebugPanel()
    this._addListeners()
    this._onResize()

    gsap.ticker.add(() => {
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
        uProgress: { value: 0 },
        uResolution: {
          value: new Vec2(
            this.gl.canvas.clientWidth,
            this.gl.canvas.clientHeight
          )
        }
      }
    })

    this.mesh = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program
    })
  }

  _createDebugPanel() {
    const pane = new Pane()

    pane.addInput(this.program.uniforms.uProgress, 'value', { label: 'uProgress', min: 0, max: 1, step: 0.01 })
  }

  _addListeners() {
    window.addEventListener('resize', this._onResize.bind(this), { passive: true })
  }

  _onResize() {
    this.renderer.setSize(this.wrapper.clientWidth, this.wrapper.clientHeight)

    // Update the uResolution uniform
    this.program.uniforms.uResolution.value = new Vec2(
      this.gl.canvas.clientWidth,
      this.gl.canvas.clientHeight
    )
  }
}

const app = new WebGLCarousel()
app.init()
