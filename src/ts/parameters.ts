import * as Loader from "./loader";

import "./page-interface-generated";


/* === IDs ============================================================ */
const controlId = {
    PARAMETERS_MAP_TABS: "map-tabs-id",
    INPUT_IMAGE_UPLOAD: "input-image-upload-button",
    PATTERNS_SCALE: "pattern-scale-range-id",
    A_FEEDING_RANGE: "A-feeding-range-id",
    A_DIFFUSION_RANGE: "A-diffusion-range-id",
    B_KILLING_RANGE: "B-killing-range-id",
    B_DIFFUSION_RANGE: "B-diffusion-range-id",
    PICK_VALUES_BUTTON: "pick-values-button-id",
    RESET_VALUES_BUTTON: "reset-values-button-id",

    SPEED_RANGE: "speed-range-id",
    BRUSH_SIZE_RANGE: "brush-size-range-id",
    BRUSH_DISPLAY_CHECKBOX: "brush-display-checkbox-id",
    INITIAL_STATE_TABS: "initial-state-tabs-id",
    RESET_BUTTON: "reset-button-id",

    DISPLAY_MODE_TABS: "display-mode-tabs-id",
    BLUR_RANGE: "blur-range-id",
    INDICATORS_CHECKBOX: "indicators-checkbox-id",

    IMAGE_DOWNLOAD: "image-download-id",
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
    VALUE_PICKING = "value_picking", // technical, not defined in the control
    IMAGE = "image",
}
let isInValuePickingMode = false;

enum EInitialState {
    BLANK = "blank",
    DISC = "disc",
    CIRCLE = "circle",
}

enum EDisplayMode {
    MONOCHROME = "monochrome",
    TRICOLOR = "tricolor",
}

const updateParametersVisibility = () => {
    const map = Parameters.parametersMap;
    Page.Controls.setVisibility(controlId.A_FEEDING_RANGE, map !== EParametersMap.IMAGE);
    Page.Controls.setVisibility(controlId.B_KILLING_RANGE, map !== EParametersMap.IMAGE);
    Page.Controls.setVisibility(controlId.PICK_VALUES_BUTTON, map !== EParametersMap.IMAGE);
    Page.Controls.setVisibility(controlId.RESET_VALUES_BUTTON, map !== EParametersMap.IMAGE);
    Page.Controls.setVisibility(controlId.PATTERNS_SCALE, map === EParametersMap.IMAGE);
    Page.Controls.setVisibility(controlId.A_DIFFUSION_RANGE, map !== EParametersMap.IMAGE);
    Page.Controls.setVisibility(controlId.B_DIFFUSION_RANGE, map !== EParametersMap.IMAGE);
    Page.Controls.setVisibility(controlId.INPUT_IMAGE_UPLOAD, map === EParametersMap.IMAGE);
    Page.Controls.setVisibility(controlId.DISPLAY_MODE_TABS, map === EParametersMap.IMAGE);
};

abstract class Parameters {
    public static readonly imageUploadObservers: ImageUploadObserver[] = [];
    public static readonly imageDownloadObservers: Observer[] = [];
    public static readonly canvasResizeObservers: Observer[] = [];
    public static readonly resetObservers: Observer[] = [];
    public static readonly blurChangeObservers: Observer[] = [];

    public static get parametersMap(): EParametersMap {
        if (isInValuePickingMode) {
            return EParametersMap.VALUE_PICKING;
        }
        return Page.Tabs.getValues(controlId.PARAMETERS_MAP_TABS)[0] as EParametersMap;
    }
    public static exitValuePickingMode(): void {
        isInValuePickingMode = false;
        Page.Tabs.setValues(controlId.PARAMETERS_MAP_TABS, [EParametersMap.UNIFORM]);
        updateParametersVisibility();
    }

    public static get patternsScale(): number {
        return Page.Range.getValue(controlId.PATTERNS_SCALE);
    }
    public static get AFeedingRate(): number {
        return Page.Range.getValue(controlId.A_FEEDING_RANGE);
    }
    public static set AFeedingRate(value: number) {
        Page.Range.setValue(controlId.A_FEEDING_RANGE, value, true);
    }
    public static get ADiffusionRate(): number {
        return Page.Range.getValue(controlId.A_DIFFUSION_RANGE);
    }
    public static get BKillingRate(): number {
        return Page.Range.getValue(controlId.B_KILLING_RANGE);
    }
    public static set BKillingRate(value: number) {
        Page.Range.setValue(controlId.B_KILLING_RANGE, value, true);
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
        return !isInValuePickingMode && Page.Checkbox.isChecked(controlId.BRUSH_DISPLAY_CHECKBOX);
    }
    public static get initialState(): EInitialState {
        if (isInValuePickingMode) {
            return EInitialState.CIRCLE;
        }
        return Page.Tabs.getValues(controlId.INITIAL_STATE_TABS)[0] as EInitialState;
    }

    public static get blur(): number {
        return Page.Range.getValue(controlId.BLUR_RANGE);
    }

    public static get displayMode(): EDisplayMode {
        if (Parameters.parametersMap === EParametersMap.IMAGE) {
            return Page.Tabs.getValues(controlId.DISPLAY_MODE_TABS)[0] as EDisplayMode;
        } else {
            return EDisplayMode.MONOCHROME;
        }
    }
}

const callCanvasResizeObservers = () => { callObservers(Parameters.canvasResizeObservers); };
Page.Canvas.Observers.canvasResize.push(callCanvasResizeObservers);

const callResetObservers = () => { callObservers(Parameters.resetObservers); };
Page.Button.addObserver(controlId.RESET_BUTTON, callResetObservers);
Page.Tabs.addObserver(controlId.PARAMETERS_MAP_TABS, callResetObservers);
Page.Tabs.addObserver(controlId.DISPLAY_MODE_TABS, callResetObservers);
Page.Tabs.addObserver(controlId.INITIAL_STATE_TABS, callResetObservers);
Parameters.imageUploadObservers.push(callResetObservers);

Page.Tabs.addObserver(controlId.PARAMETERS_MAP_TABS, () => {
    isInValuePickingMode = false;
    updateParametersVisibility();
});
updateParametersVisibility();

const updateIndicatorsVisibility = () => {
    Page.Canvas.setIndicatorsVisibility(Page.Checkbox.isChecked(controlId.INDICATORS_CHECKBOX));
};
Page.Checkbox.addObserver(controlId.INDICATORS_CHECKBOX, updateIndicatorsVisibility);
updateIndicatorsVisibility();

Page.Button.addObserver(controlId.RESET_VALUES_BUTTON, () => {
    Page.Range.setValue(controlId.A_FEEDING_RANGE, 0.054, true);
    Page.Range.setValue(controlId.A_DIFFUSION_RANGE, 0.2097, true);
    Page.Range.setValue(controlId.B_KILLING_RANGE, 0.0620, true);
    Page.Range.setValue(controlId.B_DIFFUSION_RANGE, 0.1050, true);
});

Page.Button.addObserver(controlId.PICK_VALUES_BUTTON, () => {
    Page.Tabs.setValues(controlId.PARAMETERS_MAP_TABS, []);
    isInValuePickingMode = true;
    updateParametersVisibility();
    callResetObservers();
});

Page.Range.addObserver(controlId.BLUR_RANGE, () => {
    callObservers(Parameters.blurChangeObservers);
});

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
{
    const id = "default-image";
    Loader.registerLoadingObject(id);

    const defaultImage = new Image();
    defaultImage.addEventListener("load", () => {
        Loader.registerLoadedObject(id);

        for (const observer of Parameters.imageUploadObservers) {
            observer(defaultImage);
        }
    });
    defaultImage.src = "./resources/cat.jpg";
}

Page.FileControl.addDownloadObserver(controlId.IMAGE_DOWNLOAD, () => {
    callObservers(Parameters.imageDownloadObservers);
    callResetObservers();
});

export {
    EDisplayMode,
    EInitialState,
    EParametersMap,
    Parameters,
};
