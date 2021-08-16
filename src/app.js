import { Renderer, Program, Mesh, Triangle, Vec2, Texture } from 'ogl'
import { gsap } from 'gsap'
import { Pane } from 'tweakpane'
import ColorThief from 'colorthief'

class WebGLCarousel {
  constructor() {
    this.wrapper = document.querySelector('[data-canvas-wrapper]')

    this.texturesURLs = [
      '/images/1.jpg',
      '/images/2.jpg',
      '/images/3.jpg',
      '/images/4.jpg'   
    ]

    this.state = {
      isAnimating: false,
      currentTextureIndex: 0,
      texture0: null,
      texture1: null
    }

    this.ui = {
      buttons: document.querySelectorAll('[data-carousel-control]'),
      slides: document.querySelectorAll('[data-slide]')
    }
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
            this.state.texture0.width,
            this.state.texture0.height
          )

          this.program.uniforms.uTexture1Size.value = new Vec2(
            this.state.texture1.width,
            this.state.texture1.height
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
          value: new Vec2(4, 8)
        },
        uTexture0: {
          value: this.state.texture0
        },
        uTexture0Size: {
          value: new Vec2(
            this.state.texture0.width,
            this.state.texture0.height
          )
        },
        uTexture1: {
          value: this.state.texture1
        },
        uTexture1Size: {
          value: new Vec2(
            this.state.texture1.width,
            this.state.texture1.height
          )
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
        uTime: { value: 0 },
        uAnimationDirection: { value: 1 }
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
          this.state.texture0 = res[0]
          this.state.texture1 = res[1]
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

    for (const button of this.ui.buttons) {
      button.addEventListener('click', this._onButtonClick.bind(this), { passive: true })
    }
  }

  /**
   * Animate the carousel towards the next slide.
   *
   * @method _onButtonClick()
   *
   * @param {Event} e The event triggered by the click on the button.
   */
   _onButtonClick(e) {
    // Do nothing if an animation is already running
    if (this.state.isAnimating) return

    // Get the direction of the clicked button (defaults to 1)
    const direction = Number(e.currentTarget.dataset.dir ?? 1)

    // Define the index of the texture that will be set as texture1
    let nextTextureIndex = this.state.currentTextureIndex + direction

    if (nextTextureIndex < 0)
      nextTextureIndex = this.textures.length - 1

    if (nextTextureIndex >= this.textures.length)
      nextTextureIndex = 0

    const currentSlide = this.ui.slides[this.state.currentTextureIndex]
    const currentSlideTitle = currentSlide.querySelector('[data-slide-title]')
    const currentSlideCopy = currentSlide.querySelector('[data-slide-copy]')

    const nextSlide = this.ui.slides[nextTextureIndex]
    const nextSlideTitle = nextSlide.querySelector('[data-slide-title]')
    const nextSlideCopy = nextSlide.querySelector('[data-slide-copy]')

    const tl = new gsap.timeline({
      onStart: () => {
        // Prevent any other animation from starting
        this.state.isAnimating = true

        // Define the direction of the rotation during the transition
        this.program.uniforms.uAnimationDirection.value = direction

        // Set the next texture to display
        this.state.texture1 = this.textures[nextTextureIndex]
        this.program.uniforms.uTexture1.value = this.state.texture1

        // Set the background colors of the next slide
        this.program.uniforms.uBackground1.value = [
          this.colors[nextTextureIndex].primary,
          this.colors[nextTextureIndex].secondary
        ]
      },
      onComplete: () => {
        // Re-enable animations
        this.state.isAnimating = false

        // Reset the `uProgress` uniform ...
        this.program.uniforms.uProgress.value = 0

        // ... and set what was only the next texture as current texture
        this.state.texture0 = this.textures[nextTextureIndex]
        this.program.uniforms.uTexture0.value = this.state.texture0

        // Same thing with the background colors
        this.program.uniforms.uBackground0.value = [
          this.colors[nextTextureIndex].primary,
          this.colors[nextTextureIndex].secondary
        ]

        // End of the animation. Set the new texture's index as the current one.
        this.state.currentTextureIndex = nextTextureIndex
      }
    })

    tl
      .add('start')
      .to(currentSlideTitle, {
        '--progress': 110,
        duration: 0.5
      })
      .fromTo(nextSlideTitle, { '--progress': -110 }, {
        '--progress': 0,
        duration: 1
      }, '<0.1')

      .to(currentSlideCopy, { opacity: 0, duration: 0.35 }, 'start+=0.1')
      .to(nextSlideCopy, { opacity: 1, duration: 0.5 }, '>')

      .to(this.program.uniforms.uProgress, {
        value: 1,
        duration: 1.5
      }, 'start')
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
