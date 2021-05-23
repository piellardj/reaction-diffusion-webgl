import "./page-interface-generated";


/* === IDs ============================================================ */
const controlId = {
    A_FEEDING_RANGE: "A-feeding-range-id",
    A_DIFFUSION_RANGE: "A-diffusion-range-id",
    B_KILLING_RANGE: "B-killing-range-id",
    B_DIFFUSION_RANGE: "B-diffusion-range-id",
};

type Observer = () => unknown;

function callObservers(observers: Observer[]): void {
    for (const observer of observers) {
        observer();
    }
}

abstract class Parameters {
    public static readonly canvasResizeObservers: Observer[] = [];

    public static get AFeedingRate(): number {
        return Page.Range.getValue(controlId.A_FEEDING_RANGE);
    }

    public static get ADiffusionRate(): number {
        return Page.Range.getValue(controlId.A_DIFFUSION_RANGE);
    }

    public static get BKillingRate(): number {
        return Page.Range.getValue(controlId.B_KILLING_RANGE);
    }

    public static get BDIffusionRate(): number {
        return Page.Range.getValue(controlId.B_DIFFUSION_RANGE);
    }
}

const callCanvasResizeObservers = () => { callObservers(Parameters.canvasResizeObservers); };
Page.Canvas.Observers.canvasResize.push(callCanvasResizeObservers);

export {
    Parameters,
};
