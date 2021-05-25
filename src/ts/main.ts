import * as GLCanvas from "./gl-utils/gl-canvas";
import { gl } from "./gl-utils/gl-canvas";

import * as FPSIndicator from "./fps-indicator";
import { Parameters } from "./parameters";

import "./page-interface-generated";
import { Engine } from "./engine";
import { Visor } from "./visor";


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

        if (needToAdjustCanvasSize) {
            GLCanvas.adjustSize(false);
            const canvasSize = Page.Canvas.getSize();
            gl.viewport(0, 0, canvasSize[0], canvasSize[1]);
            engine.initialize(canvasSize[0], canvasSize[1]);
            needToAdjustCanvasSize = false;
        }

        if (needToReset) {
            const canvasSize = Page.Canvas.getSize();
            engine.initialize(canvasSize[0], canvasSize[1]);
            needToReset = false;
        }

        engine.update();
        engine.drawToCanvas();

        visor.update();

        if (needToDownload) {
            // download in the loop because preserveDrawingBuffer is false
            // also, download before drawing the brush
            download();
            needToDownload = false;
        }

        if (Parameters.displayBrush) {
            engine.displayBrush();
        }

        requestAnimationFrame(mainLoop);
    }
    mainLoop();
}

function download(): void {
    const canvas = Page.Canvas.getCanvas();
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
