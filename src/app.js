import { Renderer, Program, Mesh, Triangle, Vec2, Texture } from 'ogl'
import { gsap } from 'gsap'
import { Pane } from 'tweakpane'

class WebGLCarousel {
  constructor() {
    this.wrapper = document.querySelector('[data-canvas-wrapper]')

    this.texturesURLs = [
      '/images/stewart-maclean-mT8E8qJGfmE-unsplash.jpg',
      '/images/patrick-Qsy50Y7uEf0-unsplash.jpg',
      '/images/masahiro-miyagi-YF7yruF3W5E-unsplash.jpg'
    ]
  }

  init() {
    this._createRenderer()

    this._loadTextures()
      .then(() => {
        this._createScene()
        this._createDebugPanel()
        this._addListeners()
        this._onResize()

        gsap.ticker.add(() => {
          this.renderer.render({ scene: this.mesh })
        })
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
        },
        uGridSize: {
          value: new Vec2(5, 3)
        },
        uTexture0: {
          value: this.textures[0]
        }
      }
    })

    this.mesh = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program
    })
  }

  /**
   * Load an image and add it to the `this.textures` array.
   *
   * @method _loadTexture()
   *
   * @param {String} url The URL of the image to load.
   * @param {Number} index The index of the image in the `this.texturesURLs` array.
   *
   * @returns `Promise` when the texture has been loaded and added to the `this.textures` array
   */
   _loadTexture(url, index) {
    return new Promise(resolve => {
      const img = new Image()
      img.src = url

      img.onload = () => {
        this.textures[index] = new Texture(this.gl, {
          image: img
        })

        resolve()
      }
    })
  }

  /**
   * Load all the images from the `this.texturesURLs` array.
   *
   * @method _loadTextures()
   *
   * @returns `Promise` when all the images have been loaded.
   */
  _loadTextures() {
    return new Promise(resolve => {
      this.textures = []

      const promises = this.texturesURLs.map((url, index) => this._loadTexture(url, index))

      Promise
        .all(promises)
        .then(() => resolve())
    })
  }

  _createDebugPanel() {
    const pane = new Pane()

    pane.addInput(this.program.uniforms.uProgress, 'value', { label: 'uProgress', min: 0, max: 1, step: 0.01 })

    pane.addInput(this.program.uniforms.uGridSize.value, 'x', { label: 'Grid size X', min: 0, max: 20, step: 1 })
    pane.addInput(this.program.uniforms.uGridSize.value, 'y', { label: 'Grid size Y', min: 0, max: 20, step: 1 })
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
