import "./page-interface-generated";


/* === IDs ============================================================ */
const controlId = {
    PARAMETERS_MAP_TABS: "map-tabs-id",
    INPUT_IMAGE_UPLOAD: "input-image-upload-button",
    A_FEEDING_RANGE: "A-feeding-range-id",
    A_DIFFUSION_RANGE: "A-diffusion-range-id",
    B_KILLING_RANGE: "B-killing-range-id",
    B_DIFFUSION_RANGE: "B-diffusion-range-id",

    SPEED_RANGE: "speed-range-id",
    BRUSH_SIZE_RANGE: "brush-size-range-id",
    BRUSH_DISPLAY_CHECKBOX: "brush-display-checkbox-id",
    INITIAL_STATE_TABS: "initial-state-tabs-id",
    RESET_BUTTON: "reset-button-id",

    INDICATORS_CHECKBOX: "indicators-checkbox-id",
};

type Observer = () => unknown;
type ImageUploadObserver = (image: HTMLImageElement) => unknown;

function callObservers(observers: Observer[]): void {
    for (const observer of observers) {
        observer();
    }
}

enum EParametersMap {
    UNIFORM = "uniform",
    RANGE = "range",
    IMAGE = "image",
}

enum EInitialState {
    BLANK = "blank",
    DISC = "disc",
    CIRCLE = "circle",
}

abstract class Parameters {
    public static readonly imageUploadObservers: ImageUploadObserver[] = [];
    public static readonly canvasResizeObservers: Observer[] = [];
    public static readonly resetObservers: Observer[] = [];

    public static get parametersMap(): EParametersMap {
        return Page.Tabs.getValues(controlId.PARAMETERS_MAP_TABS)[0] as EParametersMap;
    }
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
    public static get initialState(): EInitialState {
        return Page.Tabs.getValues(controlId.INITIAL_STATE_TABS)[0] as EInitialState;
    }
}

const callCanvasResizeObservers = () => { callObservers(Parameters.canvasResizeObservers); };
Page.Canvas.Observers.canvasResize.push(callCanvasResizeObservers);

const callResetObservers = () => { callObservers(Parameters.resetObservers); };
Page.Button.addObserver(controlId.RESET_BUTTON, callResetObservers);

const updateParametersVisibility = () => {
    const map = Parameters.parametersMap;
    Page.Controls.setVisibility(controlId.A_FEEDING_RANGE, map === EParametersMap.UNIFORM);
    Page.Controls.setVisibility(controlId.B_KILLING_RANGE, map === EParametersMap.UNIFORM);
    Page.Controls.setVisibility(controlId.A_DIFFUSION_RANGE, map !== EParametersMap.IMAGE);
    Page.Controls.setVisibility(controlId.B_DIFFUSION_RANGE, map !== EParametersMap.IMAGE);
    Page.Controls.setVisibility(controlId.INPUT_IMAGE_UPLOAD, map === EParametersMap.IMAGE);
};
Page.Tabs.addObserver(controlId.PARAMETERS_MAP_TABS, updateParametersVisibility);
updateParametersVisibility();

const updateIndicatorsVisibility = () => {
    Page.Canvas.setIndicatorsVisibility(Page.Checkbox.isChecked(controlId.INDICATORS_CHECKBOX));
};
Page.Checkbox.addObserver(controlId.INDICATORS_CHECKBOX, updateIndicatorsVisibility);
updateIndicatorsVisibility();

Page.FileControl.addUploadObserver(controlId.INPUT_IMAGE_UPLOAD, (filesList: FileList) => {
    if (filesList.length === 1) {
        const reader = new FileReader();
        reader.onload = () => {
            const image = new Image();
            image.addEventListener("load", () => {
                for (const observer of Parameters.imageUploadObservers) {
                    observer(image);
                }
            });
            image.src = reader.result as string;
        };
        reader.readAsDataURL(filesList[0]);
    }
});

export {
    EInitialState,
    EParametersMap,
    Parameters,
};
