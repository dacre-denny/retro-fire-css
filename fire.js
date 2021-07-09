class FirePainter {

    static get inputProperties() {
        return [
            `--time`,
        ]
    }
    
    static get inputArguments () {
      return []
    }

    constructor() {
        
    }

    simulate(context, w, h) {
        
        context.beginPath();
        context.fillStyle = 'rgb(0,0,0)'
        context.rect(0, 0, w, h)
        context.fill();

        const heat = new Float32Array(w * h)
        heat.fill(0)

        ///

        const gradient = [
            0, 0, 0,
            45, 0, 0,
            65, 0, 0,
            90, 0, 0,
            135, 0, 0,
            184, 0, 0,
            255, 60, 0,
            255, 166, 0,
            255, 225, 0,
            255, 243, 154,
            255, 255, 255,
        ]

        //

        const index = (x, y) => (y * w) + x

        const frame = () => {

            // Set heat along bottom to start with
            for (let x = 0; x < w; x++) {

                const starter = Math.random() * 0.35 + 0.65

                heat[index(x, h - 1)] = starter
            }

            // Simulate fire
            for (let x = 0; x < w; x++) {
                for (let y = 1; y < h - 1; y++) {

                    // Read bottom and right cells for simulation
                    const b = heat[index(x, y + 1)]
                    const r = x < w - 1 ? heat[index(x + 1, y)] : 0

                    // Turbulence 
                    const t = (1 - Math.random() * 0.1)

                    // Final cell heat
                    const f = (b * 0.975 + r * 0.025) * t

                    heat[index(x, y)] = f
                }
            }
        }
        
        // Iterate
        for(let i = 0; i < 100; i++) {
            frame()
        }
        
        // Transfer simulation to presentation
        for (let x = 0; x < w; x++) {
            for (let y = 0; y < h; y++) {

                // Heat intensity between 0.0 - 1.0
                const intensity = heat[index(x, y)]

                // Achieve posterize effect between colors of a limited gradient palette
                const color = Math.floor(intensity * (gradient.length / 3)) * 3              
                
                context.beginPath();
                context.fillStyle = `rgb(${gradient[color + 0]},${gradient[color + 1]},${gradient[color + 2]})`;
                context.rect(x, y, 1, 1);
                context.fill();
            }
        }
    }

    paint(ctx, geom, properties) {
        // const lineWidth = Number(properties.get(`--time`))
console.log(geom)

        this.simulate(ctx, geom.width, geom.height)

        return

        // Use `ctx` as if it was a normal canvas
        const colors = ['red', 'green', 'blue'];
        // const size = lineWidth ;// Math.floor((Math.random() * 32) + 1);
        const size = Math.floor((Math.random() * 32) + 1);
        for (let y = 0; y < geom.height / size; y++) {
            for (let x = 0; x < geom.width / size; x++) {
                const color = colors[(x + y) % colors.length];
                ctx.beginPath();
                ctx.fillStyle = color;
                ctx.rect(x * size, y * size, size, size);
                ctx.fill();
            }
        }
        
    }
}

registerPaint('fire', FirePainter);