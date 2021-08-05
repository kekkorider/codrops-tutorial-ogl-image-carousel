import { Renderer, Program, Mesh, Triangle, Vec2, Texture } from 'ogl'
import { gsap } from 'gsap'
import { Pane } from 'tweakpane'
import ColorThief from 'colorthief'

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
          this.program.uniforms.uTime.value += 0.1

          this.program.uniforms.uTexture0Size.value = new Vec2(
            this.textures[0].width,
            this.textures[0].height
          )

          this.program.uniforms.uTexture1Size.value = new Vec2(
            this.textures[1].width,
            this.textures[1].height
          )

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
          value: new Vec2(6, 3)
        },
        uTexture0: {
          value: this.textures[0]
        },
        uTexture0Size: {
          value: new Vec2()
        },
        uTexture1: {
          value: this.textures[1]
        },
        uTexture1Size: {
          value: new Vec2()
        },
        uNoiseTexture: {
          value: this.noiseTexture
        },
        uBackground0: {
          value: [
            this.colors[0].primary,
            this.colors[0].secondary
          ]
        },
        uBackground1: {
          value: [
            this.colors[1].primary,
            this.colors[1].secondary
          ]
        },
        uTime: { value: 0 }
      }
    })

    this.mesh = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program
    })
  }

  /**
   * Load an image as an OGL `Texture` object.
   *
   * @method _loadTexture()
   *
   * @param {String} url The URL of the image to load.
   * @param {Object} params The OGL configuration object for the `Texture` to load
   *
   * @returns `Promise` with the `Texture` object when the texture has been loaded
   */
   _loadTexture(url, params = {}) {
    return new Promise(resolve => {
      const img = new Image()
      img.src = url

      img.onload = () => {
        const texture = new Texture(this.gl, {
          ...params,
          image: img
        })

        resolve(texture)
      }
    })
  }

  /**
   * Load all the images from the `this.texturesURLs` array and the noise texture.
   *
   * @method _loadTextures()
   *
   * @returns `Promise` when all the images have been loaded.
   */
   _loadTextures() {
    return new Promise(resolve => {
      const textures = this.texturesURLs.map(url => this._loadTexture(url))
      const colorThief = new ColorThief()

      Promise
        // Load the images for the carousel
        .all(textures)
        .then(res => {
          // Fill an array of colors for each texture
          // to use for the background
          this.colors = res.map(e => {
            return ({
              primary: colorThief.getColor(e.image),
              secondary: colorThief.getPalette(e.image)[3]
            })
          })

          this.textures = res
        })

        // Load the noise texture
        .then(() => {
          return this._loadTexture('/images/Noise_18.jpg', {
            wrapS: this.gl.REPEAT,
            wrapT: this.gl.REPEAT
          })
        })
        .then(res => {
          this.noiseTexture = res
          resolve()
        })
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
