import { gsap } from 'gsap';

import { Bounds, UpdateInfo } from 'utils/sharedTypes';

interface Constructor {
  text: string;
  ctx: CanvasRenderingContext2D | null;
}

export class TextSketch {
  static defaultEase = 'power2.inOut';

  _rendererBounds: Bounds = { width: 100, height: 100 };
  _translateOffset = { x: 0, y: 0 };
  _textValue: string;
  _opacity = 1;
  _ctx: CanvasRenderingContext2D | null;
  _pixelRatio = 1;
  _textMeasures = { width: 0, height: 0, fontSize: 0 };
  _transitionTl: gsap.core.Timeline | null = null;

  constructor({ text, ctx }: Constructor) {
    this._ctx = ctx;
    this._textValue = text;
  }

  update(updateInfo: UpdateInfo) {
    if (!this._ctx) return;
    this._ctx.font = `bold ${this._textMeasures.fontSize}px roboto`;

    this._ctx.fillStyle = `rgba(0,0,0,${this._opacity})`;

    this._ctx.fillText(
      this._textValue,
      this._rendererBounds.width / 2 - this._textMeasures.width / 2 + this._translateOffset.x,
      this._rendererBounds.height / 2 + this._textMeasures.height / 2 + this._translateOffset.y
    );
  }

  _animateOffsetY(destination: number, duration: number) {
    return gsap.to(this._translateOffset, {
      y: destination,
      duration,
      ease: TextSketch.defaultEase,
    });
  }

  _animateOffsetX(destination: number, duration: number) {
    return gsap.to(this._translateOffset, {
      x: destination,
      duration,
      ease: TextSketch.defaultEase,
    });
  }

  _animateFontSize(destination: number, duration: number) {
    return gsap.to(this._textMeasures, {
      fontSize: destination,
      duration,
      ease: TextSketch.defaultEase,
      onUpdate: () => {
        if (!this._ctx) return;
        this._ctx.font = `bold ${this._textMeasures.fontSize}px roboto`;

        const metrics = this._ctx.measureText(this._textValue);
        const actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

        this._textMeasures.height = actualHeight;
        this._textMeasures.width = metrics.width;
      },
    });
  }

  setRendererBounds(bounds: Bounds) {
    this._rendererBounds = bounds;
    if (!this._ctx) return;

    this._textMeasures.fontSize = this._rendererBounds.height * 0.1;
    this._ctx.font = `bold ${this._textMeasures.fontSize}px roboto`;

    const metrics = this._ctx.measureText(this._textValue);
    const actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

    this._textMeasures.height = actualHeight;
    this._textMeasures.width = metrics.width;
  }

  setPixelRatio(value: number) {
    this._pixelRatio = value;
  }

  animateIn() {
    this._transitionTl = gsap.timeline();

    this._transitionTl
      .add(this._animateOffsetX(-300, 1.2))
      .add(this._animateFontSize(300, 0.8))
      .add(this._animateOffsetX(0, 1.2))
      .add(this._animateFontSize(100, 0.8));
  }

  destroy() {
    this._transitionTl && this._transitionTl.kill();
  }
}
