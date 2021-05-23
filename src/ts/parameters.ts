import "./page-interface-generated";


/* === IDs ============================================================ */
const controlId = {
    A_FEEDING_RANGE: "A-feeding-range-id",
    A_DIFFUSION_RANGE: "A-diffusion-range-id",
    B_KILLING_RANGE: "B-killing-range-id",
    B_DIFFUSION_RANGE: "B-diffusion-range-id",

    SPEED_RANGE: "speed-range-id",
    BRUSH_SIZE_RANGE: "brush-size-range-id",
    BRUSH_DISPLAY_CHECKBOX: "brush-display-checkbox-id",
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

    public static get speed(): number {
        return Page.Range.getValue(controlId.SPEED_RANGE);
    }
    public static get brushSize(): number {
        return Page.Range.getValue(controlId.BRUSH_SIZE_RANGE);
    }
    public static get displayBrush(): boolean {
        return Page.Checkbox.isChecked(controlId.BRUSH_DISPLAY_CHECKBOX);
    }
}

const callCanvasResizeObservers = () => { callObservers(Parameters.canvasResizeObservers); };
Page.Canvas.Observers.canvasResize.push(callCanvasResizeObservers);

export {
    Parameters,
};
