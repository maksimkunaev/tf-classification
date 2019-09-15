const defaultSettings = {
    width: 784,
    height: 784,
    pixel: 28,
};

class Canvas {
    constructor(canv, settings = defaultSettings) {
        const {
            width,
            height,
            pixel
        } = settings;

        this.is_mouse_down = false;
        this.canv = canv;
        this.canv.width = width;
        this.canv.height = height;
        this.ctx = this.canv.getContext('2d');
        this.pixel = pixel;
        this.initCanvas();
      }

      initCanvas = () => {
        let { canv, pixel, ctx, is_mouse_down } = this;
        canv.addEventListener('mousedown', (e) => {
            is_mouse_down = true;
            ctx.beginPath();
        })

        canv.addEventListener('mouseup', (e) => {
            is_mouse_down = false;
        })

        canv.addEventListener('mousemove', (e) => {
            if( is_mouse_down ) {
                const { width, height } = this.canv;
                var rect = canv.getBoundingClientRect();
                const coords =  {
                    x: width * (e.offsetX / rect.width),
                    y: width * (e.offsetY / rect.height),
                };

                ctx.fillStyle = 'red';
                ctx.strokeStyle = 'red';
                ctx.lineWidth = pixel;

                ctx.lineTo(coords.x, coords.y);
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(coords.x, coords.y, pixel / 2, 0, Math.PI * 2);
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(coords.x, coords.y);
            }
        })
      }

      drawLine = (x1, y1, x2, y2, color = 'gray') => {
        const { ctx } = this;

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineJoin = 'miter';
        ctx.lineWidth = 1;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      };


      drawCell = (x, y, w, h, color = 'blue') => {
        const { ctx } = this;

        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.lineJoin = 'miter';
        ctx.lineWidth = 1;
        ctx.rect(x, y, w, h);
        ctx.fill();
      };

      clear = () => {
        this.ctx.clearRect(0, 0, canv.width, canv.height);
      };

      filltext = (text = "", xPos, yPos) => {
        const { ctx } = this;
    console.log('filltext', text, xPos, yPos)

        ctx.font = "12px Georgia";
        ctx.fillText(text, xPos, yPos);
      };


      drawGrid = function() {
        const { canv, pixel } = this;

        const w = canv.width;
        const h = canv.height;
        const p = w / pixel;

        const xStep = w / p;
        const yStep = h / p;

        for( let x = 0; x < w; x += xStep )
        {
            this.drawLine(x, 0, x, h);
        }

        for( let y = 0; y < h; y += yStep )
        {
            this.drawLine(0, y, w, y);
        }
      };

     calculate = (draw = false) => {
        const { ctx, canv, pixel } = this;

        const w = canv.width;
        const h = canv.height;
        const p = w / pixel;

        const xStep = w / p;
        const yStep = h / p;

        const vector = [];
        let __draw = [];

        for( let y = 0; y < h; y += yStep ) {
            for( let x = 0; x < w; x += xStep ) {
                const data = ctx.getImageData(x, y, xStep, yStep);
                let nonEmptyPixelsCount = 0;
                for( let i = 0; i < data.data.length; i += 4 ) {

                    const redColor = data.data[i];
                    const opacity = data.data[i + 3];

                    // if( !isEmpty ) {
                        nonEmptyPixelsCount += redColor * opacity / 255**2;
                    // }
                }

                if( nonEmptyPixelsCount > 1 && draw ) {
                    __draw.push([x, y, xStep, yStep]);
                }

                const probability = (nonEmptyPixelsCount * 4 / data.data.length).toFixed(16);
                vector.push(Number(probability));
            }
        }

        if( draw ) {
            this.clear();
            this.drawGrid();

            for( let _d in __draw ) {
                this.drawCell( __draw[_d][0], __draw[_d][1], __draw[_d][2], __draw[_d][3] );
            }
        }

        return vector;
    };

    preview(data, type, xPos) {
        const resultData = data.filter(img => type === img.output.findIndex(index => index === 1));
        let total = resultData.length;
        let offset = 28;

        this.filltext(type, xPos, 0);

        for (let n = 0; n < total; n++) {
            drawPicture(resultData[n], xPos, offset * n + 50)
        }
    }

   drawPicture(pixels, xPos = 0, yPos = 0) {
        const imgData = this.ctx.getImageData(0, 0, 28, 28);
        const imgDataPixels = imgData.data;

        const step = 4;
        for (let i = 0; i < pixels.length; i++) {
            imgDataPixels[i * step + 1] = pixels[i]; // set every red pixel element to 255
            imgDataPixels[i * step + 3] = pixels[i]; // make this pixel opaque
        }
        this.ctx.putImageData(imgData, xPos, yPos);
    }
}

export default Canvas;