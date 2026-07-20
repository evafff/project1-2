import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'ogl';
import { useEffect, useRef } from 'react';
import './CircularGallery.css';

const lerp = (start, end, amount) => start + (end - start) * amount;
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function debounce(fn, wait) {
  let timeout;
  return (...args) => {
    window.clearTimeout(timeout);
    timeout = window.setTimeout(() => fn(...args), wait);
  };
}

class GalleryMedia {
  constructor({
    geometry,
    gl,
    image,
    index,
    length,
    scene,
    screen,
    viewport,
    bend,
    borderRadius,
  }) {
    this.extra = 0;
    this.geometry = geometry;
    this.gl = gl;
    this.image = image;
    this.index = index;
    this.length = length;
    this.scene = scene;
    this.screen = screen;
    this.viewport = viewport;
    this.bend = bend;
    this.borderRadius = borderRadius;
    this.createShader();
    this.createMesh();
    this.onResize();
  }

  createShader() {
    const texture = new Texture(this.gl, {
      generateMipmaps: true,
    });

    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      transparent: true,
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uSpeed;
        varying vec2 vUv;

        void main() {
          vUv = uv;
          vec3 p = position;
          p.z = (sin(p.x * 4.0 + uTime) * 1.3 + cos(p.y * 2.0 + uTime) * 1.3) * (0.08 + abs(uSpeed) * 0.35);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform vec2 uImageSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        varying vec2 vUv;

        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }

        void main() {
          vec2 ratio = vec2(
            min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
            min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
          );
          vec2 uv = vec2(
            vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
            vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
          );
          vec4 color = texture2D(tMap, uv);
          float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
          float alpha = 1.0 - smoothstep(-0.002, 0.002, d);
          gl_FragColor = vec4(color.rgb, color.a * alpha);
        }
      `,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [1, 1] },
        uSpeed: { value: 0 },
        uTime: { value: 100 * Math.random() },
        uBorderRadius: { value: this.borderRadius },
      },
    });

    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = this.image;
    image.onload = () => {
      texture.image = image;
      this.program.uniforms.uImageSizes.value = [image.naturalWidth, image.naturalHeight];
    };
  }

  createMesh() {
    this.plane = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program,
    });
    this.plane.setParent(this.scene);
  }

  onResize({ screen, viewport } = {}) {
    if (screen) this.screen = screen;
    if (viewport) this.viewport = viewport;

    const gapPixels = clamp(this.screen.width * 0.014, 14, 20);
    const cardWidthPixels = (this.screen.width - gapPixels * 8) / 8;
    const cardHeightPixels = cardWidthPixels * 1.15;

    this.plane.scale.x = (this.viewport.width * cardWidthPixels) / this.screen.width;
    this.plane.scale.y = (this.viewport.height * cardHeightPixels) / this.screen.height;
    this.plane.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
    this.padding = (this.viewport.width * gapPixels) / this.screen.width;
    this.width = this.plane.scale.x + this.padding;
    this.widthTotal = this.width * this.length;
    this.x = this.width * this.index;
    this.extra = 0;
  }

  update(scroll, direction) {
    this.plane.position.x = this.x - scroll.current - this.extra;
    const x = this.plane.position.x;
    const halfWidth = this.viewport.width / 2;

    if (this.bend === 0) {
      this.plane.position.y = 0;
      this.plane.rotation.z = 0;
    } else {
      const bendAbs = Math.abs(this.bend);
      const radius = (halfWidth * halfWidth + bendAbs * bendAbs) / (2 * bendAbs);
      const effectiveX = Math.min(Math.abs(x), halfWidth);
      const arc = radius - Math.sqrt(radius * radius - effectiveX * effectiveX);
      this.plane.position.y = this.bend > 0 ? -arc : arc;
      this.plane.rotation.z = (this.bend > 0 ? -1 : 1) * Math.sign(x) * Math.asin(effectiveX / radius);
    }

    this.speed = scroll.current - scroll.last;
    this.program.uniforms.uTime.value += 0.04;
    this.program.uniforms.uSpeed.value = this.speed;

    const planeOffset = this.plane.scale.x / 2;
    const viewportOffset = this.viewport.width / 2;
    const isBefore = this.plane.position.x + planeOffset < -viewportOffset;
    const isAfter = this.plane.position.x - planeOffset > viewportOffset;

    if (direction === 'right' && isBefore) {
      this.extra -= this.widthTotal;
    }
    if (direction === 'left' && isAfter) {
      this.extra += this.widthTotal;
    }
  }
}

class CircularGalleryApp {
  constructor(container, {
    items,
    bend = 2,
    borderRadius = 0.07,
    scrollSpeed = 2,
    scrollEase = 0.08,
    autoSpeed = 0.014,
  } = {}) {
    this.container = container;
    this.scrollSpeed = scrollSpeed;
    this.autoSpeed = autoSpeed;
    this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0 };
    this.onCheckDebounce = debounce(this.onCheck.bind(this), 180);
    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.onResize();
    this.createGeometry();
    this.createMedias(items, bend, borderRadius);
    this.addEventListeners();
    this.update();
  }

  createRenderer() {
    this.renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    this.container.appendChild(this.gl.canvas);
  }

  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
  }

  createScene() {
    this.scene = new Transform();
  }

  createGeometry() {
    this.planeGeometry = new Plane(this.gl, {
      heightSegments: 50,
      widthSegments: 100,
    });
  }

  createMedias(items, bend, borderRadius) {
    const galleryItems = items && items.length ? items : [];
    this.baseLength = galleryItems.length;
    this.mediasImages = galleryItems.concat(galleryItems, galleryItems);
    this.medias = this.mediasImages.map((data, index) => (
      new GalleryMedia({
        geometry: this.planeGeometry,
        gl: this.gl,
        image: data.image,
        index,
        length: this.mediasImages.length,
        scene: this.scene,
        screen: this.screen,
        viewport: this.viewport,
        bend,
        borderRadius,
      })
    ));
    this.resetPosition();
  }

  resetPosition() {
    if (!this.medias?.[0] || !this.baseLength) return;

    const centerPosition = this.medias[0].width * this.baseLength;
    this.scroll.current = centerPosition;
    this.scroll.target = centerPosition;
    this.scroll.last = centerPosition;
  }

  syncPositionAfterResize(previousItemWidth) {
    if (!this.medias?.[0] || !this.baseLength) return;

    const nextItemWidth = this.medias[0].width;
    const centerPosition = nextItemWidth * this.baseLength;

    if (!previousItemWidth) {
      this.resetPosition();
      return;
    }

    const previousLoopWidth = previousItemWidth * this.baseLength;
    const nextLoopWidth = nextItemWidth * this.baseLength;
    const previousCenter = previousLoopWidth;
    const scrollOffset = this.scroll.target - previousCenter;
    const normalizedOffset = ((scrollOffset % previousLoopWidth) + previousLoopWidth) % previousLoopWidth;
    const resizedOffset = (normalizedOffset / previousLoopWidth) * nextLoopWidth;

    this.scroll.current = centerPosition + resizedOffset;
    this.scroll.target = centerPosition + resizedOffset;
    this.scroll.last = centerPosition + resizedOffset;
  }

  onTouchDown = (event) => {
    this.isDown = true;
    this.scroll.position = this.scroll.current;
    this.start = event.touches ? event.touches[0].clientX : event.clientX;
    this.container.setPointerCapture?.(event.pointerId);
  };

  onTouchMove = (event) => {
    if (!this.isDown) return;

    const x = event.touches ? event.touches[0].clientX : event.clientX;
    const distance = (this.start - x) * (this.scrollSpeed * 0.025);
    this.scroll.target = this.scroll.position + distance;
  };

  onTouchUp = (event) => {
    this.isDown = false;
    this.container.releasePointerCapture?.(event.pointerId);
    this.onCheck();
  };

  onWheel = (event) => {
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    this.scroll.target += Math.sign(delta) * this.scrollSpeed * 0.24;
    this.onCheckDebounce();
  };

  onKeyDown = (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.scroll.target += this.scrollSpeed * 5;
      this.onCheckDebounce();
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.scroll.target -= this.scrollSpeed * 5;
      this.onCheckDebounce();
    }
  };

  onCheck() {
    if (!this.medias || !this.medias[0]) return;

    const { width } = this.medias[0];
    const itemIndex = Math.round(Math.abs(this.scroll.target) / width);
    const item = width * itemIndex;
    this.scroll.target = this.scroll.target < 0 ? -item : item;
  }

  onResize = () => {
    const containerWidth = this.container.clientWidth;
    const containerHeight = this.container.clientHeight;

    if (containerWidth < 2 || containerHeight < 2) return;

    const previousItemWidth = this.medias?.[0]?.width;

    this.screen = {
      width: containerWidth,
      height: containerHeight,
    };

    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({
      aspect: this.screen.width / this.screen.height,
    });

    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;
    this.viewport = { width, height };

    if (this.medias) {
      this.medias.forEach((media) => media.onResize({ screen: this.screen, viewport: this.viewport }));
      this.syncPositionAfterResize(previousItemWidth);
    }
  };

  update = () => {
    if (!this.isDown) {
      this.scroll.target += this.autoSpeed;
    }
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    const direction = this.scroll.current > this.scroll.last ? 'right' : 'left';

    if (this.medias) {
      this.medias.forEach((media) => media.update(this.scroll, direction));
    }

    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;
    this.raf = window.requestAnimationFrame(this.update);
  };

  addEventListeners() {
    window.addEventListener('resize', this.onResize);
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(this.onResize);
      this.resizeObserver.observe(this.container);
    }
    this.container.addEventListener('wheel', this.onWheel, { passive: true });
    this.container.addEventListener('pointerdown', this.onTouchDown);
    this.container.addEventListener('pointermove', this.onTouchMove);
    this.container.addEventListener('pointerup', this.onTouchUp);
    this.container.addEventListener('pointerleave', this.onTouchUp);
    this.container.addEventListener('keydown', this.onKeyDown);
  }

  destroy() {
    window.cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.onResize);
    this.resizeObserver?.disconnect();
    this.container.removeEventListener('wheel', this.onWheel);
    this.container.removeEventListener('pointerdown', this.onTouchDown);
    this.container.removeEventListener('pointermove', this.onTouchMove);
    this.container.removeEventListener('pointerup', this.onTouchUp);
    this.container.removeEventListener('pointerleave', this.onTouchUp);
    this.container.removeEventListener('keydown', this.onKeyDown);

    if (this.renderer?.gl?.canvas?.parentNode) {
      this.renderer.gl.canvas.parentNode.removeChild(this.renderer.gl.canvas);
    }
  }
}

export default function CircularGallery({
  items,
  bend = 2,
  borderRadius = 0.07,
  scrollSpeed = 2,
  scrollEase = 0.08,
  autoSpeed = 0.014,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return undefined;

    const app = new CircularGalleryApp(containerRef.current, {
      items,
      bend,
      borderRadius,
      scrollSpeed,
      scrollEase,
      autoSpeed,
    });

    return () => app.destroy();
  }, [items, bend, borderRadius, scrollSpeed, scrollEase, autoSpeed]);

  return (
    <div
      className="circular-gallery"
      ref={containerRef}
      tabIndex={0}
      role="region"
      aria-label="作品循环画廊"
    />
  );
}
