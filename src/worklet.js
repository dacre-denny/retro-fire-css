const PARAMETER_PROPERTIES = {
  scale: '--scale',
  ambient: '--ambient',
  turbulence: '--turbulence',
  scatter: '--scatter'
};

const THERMAL_GRADIENT = [
  `rgb(0, 0, 0)`,
  `rgb(45, 0, 0)`,
  `rgb(65, 0, 0)`,
  `rgb(90, 0, 0)`,
  `rgb(135, 0, 0)`,
  `rgb(184, 0, 0)`,
  `rgb(255, 60, 0)`,
  `rgb(255, 166, 0)`,
  `rgb(255, 225, 0)`,
  `rgb(255, 243, 154)`,
  `rgb(255, 255, 255)`
];

/**
 *
 * @param {*} v
 * @param {*} min
 * @param {*} max
 * @returns
 */
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

/**
 *
 * @param {*} x
 * @param {*} y
 * @param {*} w
 * @returns
 */
const index = (x, y, w) => y * w + x;

/**
 *
 * @param {*} size
 * @param {*} param1
 * @returns
 */
const simulate = (size, { scale, scatter, ambient, turbulence }) => {
  const width = Math.ceil(size.width / scale);
  const height = Math.ceil(size.height / scale);
  const buffer = new Float32Array(width * height);

  // Find the nth (target ambient tempurate) root (height range that simulation runs over)
  // to find attenuation rate from one row to the next, seeing each row is multiplied against
  // the previous
  const attenuation = Math.pow(ambient, 1 / height);

  // Set heat along bottom to start with
  for (let x = 0; x < width; x++) {
    const starter = Math.random() * scatter + (1 - scatter);

    buffer[index(x, height - 1, width)] = starter;
  }

  // Iterate from bottom to top
  for (let y = height - 2; y >= 0; y--) {
    // Set heat along bottom to start with
    for (let x = 0; x < width; x++) {
      // Turbulence
      const r = Math.random();
      const t = 1 - r * turbulence;

      // Randomly read bottom left, bottom, or bottom right cells for pseduo random
      // diffusion-like effect
      const sample =
        r < 0.3
          ? buffer[index((width - (x - 1)) % width, y + 1, width)]
          : r > 0.7
          ? buffer[index((x + 1) % width, y + 1, width)]
          : buffer[index(x, y + 1, width)];

      const tempurature = sample * attenuation * t;

      buffer[index(x, y, width)] = tempurature;
    }
  }

  return { buffer, width, height };
};

/**
 *
 * @param {*} context
 * @param {*} size
 * @param {*} param2
 * @param {*} param3
 */
const render = (context, size, { buffer, width, height }, { scale }) => {
  context.beginPath();
  context.fillStyle = 'rgb(0,0,0)';
  context.rect(0, 0, size.width, size.height);
  context.fill();

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const tempurature = buffer[index(x, y, width)];
      const thermalIndex = Math.floor(tempurature * THERMAL_GRADIENT.length);
      const thermalColor = THERMAL_GRADIENT[thermalIndex];

      context.beginPath();
      context.fillStyle = thermalColor;
      context.rect(x * scale, y * scale, scale, scale);
      context.fill();
    }
  }
};

registerPaint(
  'retro-fire',
  class {
    static get inputProperties() {
      return Object.values(PARAMETER_PROPERTIES);
    }

    static get inputArguments() {
      return [];
    }

    static get contextOptions() {
      return { alpha: true };
    }

    paint(context, size, properties) {
      const params = {
        scale: 1,
        scatter: 0.25,
        ambient: 0.15,
        turbulence: 0.0125
      };

      for (const param in PARAMETER_PROPERTIES) {
        const variable = PARAMETER_PROPERTIES[param];
        const value = Number.parseFloat(properties.get(variable).toString());
        if (!Number.isNaN(value)) {
          params[param] = value;
        }
      }

      params.scale = Math.floor(clamp(params.scale, 1, 100));
      params.scatter = clamp(params.scatter, 0, 1);
      params.ambient = clamp(params.ambient, 0, 1);
      params.turbulence = clamp(params.turbulence, 0, 1) * 0.05;

      const simulation = simulate(size, params);

      render(context, size, simulation, params);
    }
  }
);
