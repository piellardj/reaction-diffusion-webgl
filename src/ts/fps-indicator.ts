import "./page-interface-generated";


let framesSinceLastFPSUpdate = 0;
let timeOfLastFPSUpdate = performance.now();

setInterval(() => {
    const now = performance.now();
    const fps = 1000 * framesSinceLastFPSUpdate / (now - timeOfLastFPSUpdate);
    timeOfLastFPSUpdate = now;
    framesSinceLastFPSUpdate = 0;

    Page.Canvas.setIndicatorText("fps-indicator", Math.round(fps).toString());
}, 500);

function registerFrame(): void {
    framesSinceLastFPSUpdate++;
}

export { registerFrame };
