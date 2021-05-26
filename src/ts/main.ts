import { Engine } from "./engine";
import * as FPSIndicator from "./fps-indicator";

import * as GLCanvas from "./gl-utils/gl-canvas";
import { gl } from "./gl-utils/gl-canvas";

import { Parameters } from "./parameters";
import { Visor } from "./visor";

import "./page-interface-generated";


function main(): void {
    const webglFlags = {
        alpha: false,
        antialias: true,
        depth: false,
        stencil: false,
        preserveDrawingBuffer: false,
    };
    if (!GLCanvas.initGL(webglFlags)) {
        return;
    }
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.BLEND);

    const canvas = Page.Canvas.getCanvas();

    Parameters.blurChangeObservers.push(() => { updateBlur(canvas); });
    updateBlur(canvas);

    let needToAdjustCanvasSize = true;
    Parameters.canvasResizeObservers.push(() => { needToAdjustCanvasSize = true; });

    let needToReset = true;
    Parameters.resetObservers.push(() => { needToReset = true; });

    let needToDownload = false;
    Parameters.imageDownloadObservers.push(() => { needToDownload = true; });

    const engine = new Engine();
    const visor = new Visor();

    function mainLoop(): void {
        FPSIndicator.registerFrame();

        if (needToDownload) {
            // redraw before resizing the canvas because the download pane might open, which changes the canvas size
            engine.drawToCanvas(); // redraw because preserveDrawingBuffer is false
            download(canvas);
            needToDownload = false;
        }

        if (needToAdjustCanvasSize) {
            GLCanvas.adjustSize(false);
            gl.viewport(0, 0, canvas.width, canvas.height);
            engine.initialize(canvas.width, canvas.height);
            needToAdjustCanvasSize = false;
        }

        if (needToReset) {
            engine.initialize(canvas.width, canvas.height);
            needToReset = false;
        }

        engine.update();
        engine.drawToCanvas();

        visor.update();

        if (Parameters.displayBrush) {
            engine.displayBrush();
        }

        requestAnimationFrame(mainLoop);
    }
    mainLoop();
}

function updateBlur(canvas: HTMLElement): void {
    const blur = Parameters.blur;
    if (blur <= 0) {
        canvas.style.filter = "";
    } else {
        canvas.style.filter = `blur(${blur}px)`;
    }
}

function download(canvas: HTMLCanvasElement): void {
    const name = "reaction-diffusion.png";

    if ((canvas as any).msToBlob) { // for IE
        const blob = (canvas as any).msToBlob();
        window.navigator.msSaveBlob(blob, name);
    } else {
        canvas.toBlob((blob: Blob) => {
            const link = document.createElement("a");
            link.download = name;
            link.href = URL.createObjectURL(blob);
            link.click();
        });
    }
}

main();
