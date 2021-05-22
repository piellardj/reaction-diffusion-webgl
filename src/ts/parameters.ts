import "./page-interface-generated";


/* === IDs ============================================================ */
// const controlId = {};

type Observer = () => unknown;

function callObservers(observers: Observer[]): void {
    for (const observer of observers) {
        observer();
    }
}

abstract class Parameters {
    public static readonly canvasResizeObservers: Observer[] = [];
}

const callCanvasResizeObservers = () => { callObservers(Parameters.canvasResizeObservers); };
Page.Canvas.Observers.canvasResize.push(callCanvasResizeObservers);

export {
    Parameters,
};
