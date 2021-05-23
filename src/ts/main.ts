import * as GLCanvas from "./gl-utils/gl-canvas";
import { gl } from "./gl-utils/gl-canvas";

import * as FPSIndicator from "./fps-indicator";
import { Parameters } from "./parameters";

import "./page-interface-generated";
import { Engine } from "./engine";


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

    const engine = new Engine();

    function mainLoop(): void {
        FPSIndicator.registerFrame();

        if (needToAdjustCanvasSize) {
            GLCanvas.adjustSize(false);
            const canvasSize = Page.Canvas.getSize();
            gl.viewport(0, 0, canvasSize[0], canvasSize[1]);
            engine.initialize(canvasSize[0], canvasSize[1]);
            needToAdjustCanvasSize = false;
        }

        engine.update();
        engine.drawToCanvas();

        requestAnimationFrame(mainLoop);
    }
    mainLoop();
}

main();
