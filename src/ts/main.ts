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

        if (Parameters.displayBrush) {
            engine.displayBrush();
        }

        requestAnimationFrame(mainLoop);
    }
    mainLoop();
}

main();
