class FirePainter {
  static get inputProperties() {
    return [`--time`];
  }

  static PIXEL_SIZE = 2;

  static get inputArguments() {
    return [];
  }

  constructor() {
    this.colorGradient = [
      0, 0, 0, 45, 0, 0, 65, 0, 0, 90, 0, 0, 135, 0, 0, 184, 0, 0, 255, 60, 0,
      255, 166, 0, 255, 225, 0, 255, 243, 154, 255, 255, 255
    ];

    this.simulationScale = 2;
    this.displayScale = 1;
  }

  render(context, buffer, width, height, geometry) {
    context.beginPath();
    context.fillStyle = 'rgb(0,0,0)';
    context.rect(0, 0, geometry.width, geometry.height);
    context.fill();

    // dedupe
    const index = (x, y) => y * width + x;

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const intensity = buffer[index(x, y)];
        const color =
          Math.floor(intensity * (this.colorGradient.length / 3)) * 3;

        context.beginPath();
        context.fillStyle = `rgb(${this.colorGradient[color + 0]},${
          this.colorGradient[color + 1]
        },${this.colorGradient[color + 2]})`;
        // console.log('x=', x);
        // console.log('y=', y);
        context.rect(
          x * FirePainter.PIXEL_SIZE,
          y * FirePainter.PIXEL_SIZE,
          FirePainter.PIXEL_SIZE,
          FirePainter.PIXEL_SIZE
        );
        context.fill();
      }
    }
  }

  foo(buffer, width, height) {
    // Find the nth (target ambient tempurate) root (height range that simulation runs over)
    // to find attenuation rate from one row to the next, seeing each row is multiplied against
    // the previous
    const ambeint = 0.15;
    const attenuation = Math.pow(ambeint, 1 / height);

    const index = (x, y) => y * width + x;

    // Set heat along bottom to start with
    for (let x = 0; x < width; x++) {
      const VARIANCE = 0.125;
      const starter = Math.random() * VARIANCE + (1 - VARIANCE);

      buffer[index(x, height - 1)] = starter;
    }
    // return;
    // Iterate from bottom to top
    for (let y = height - 2; y >= 0; y--) {
      // Set heat along bottom to start with
      for (let x = 0; x < width; x++) {
        // Read bottom and right cells for simulation
        const b = buffer[index(x, y + 1)];
        const br = buffer[index((x + 1) % width, y + 1)];

        // Turbulence
        const t = 1 - Math.random() * 0.125;

        // Final cell heat
        const CROSS_WIND = 0; // 0.125;
        // const f = ((1 - CROSS_WIND) * b + CROSS_WIND * br) * attenuation * t;
        const f = (Math.random() > 0.5 ? b : br) * attenuation * t;

        buffer[index(x, y)] = f;
      }
    }
  }

  paint(ctx, geom, properties) {
    const w = Math.ceil(geom.width / FirePainter.PIXEL_SIZE);
    const h = Math.ceil(geom.height / FirePainter.PIXEL_SIZE);
    const buffer = new Float32Array(w * h);

    console.log('size', 'size=', FirePainter.PIXEL_SIZE);
    console.log('geom', 'w=', geom.width, 'h=', geom.height);
    console.log('buffer', 'w=', w, 'h=', h);

    this.foo(buffer, w, h);

    this.render(ctx, buffer, w, h, geom);
  }
}

registerPaint('fire', FirePainter);
