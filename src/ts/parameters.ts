import { EDisplayMode, EInitialState, EParametersMap, EShading } from "./enums";
import * as Loader from "./loader";
import { Presets } from "./presets";

import "./page-interface-generated";


/* === IDs ============================================================ */
const controlId = {
    PARAMETERS_MAP_TABS: "map-tabs-id",
    PRESET_SELECT: "presets-fixed-select-id",
    INPUT_IMAGE_UPLOAD: "input-image-upload-button",
    PATTERNS_SCALE: "pattern-scale-range-id",
    A_FEEDING_RANGE: "A-feeding-range-id",
    A_DIFFUSION_RANGE: "A-diffusion-range-id",
    B_KILLING_RANGE: "B-killing-range-id",
    B_DIFFUSION_RANGE: "B-diffusion-range-id",
    PICK_VALUES_BUTTON: "pick-values-button-id",

    SPEED_RANGE: "speed-range-id",
    BRUSH_SIZE_RANGE: "brush-size-range-id",
    BRUSH_DISPLAY_CHECKBOX: "brush-display-checkbox-id",
    INITIAL_STATE_TABS: "initial-state-tabs-id",
    RESET_BUTTON: "reset-button-id",

    DISPLAY_MODE_TABS: "display-mode-tabs-id",
    SHADING_TABS: "shading-tabs-id",
    ZOOM_RANGE: "zoom-range-id",
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

let isInValuePickingMode = false;

const updateParametersVisibility = () => {
    const map = Parameters.parametersMap;
    const displayMode = Parameters.displayMode;
    Page.Controls.setVisibility(controlId.PRESET_SELECT, map !== EParametersMap.IMAGE);
    Page.Controls.setVisibility(controlId.A_FEEDING_RANGE, map !== EParametersMap.IMAGE);
    Page.Controls.setVisibility(controlId.B_KILLING_RANGE, map !== EParametersMap.IMAGE);
    Page.Controls.setVisibility(controlId.PICK_VALUES_BUTTON, map !== EParametersMap.IMAGE);
    Page.Controls.setVisibility(controlId.PATTERNS_SCALE, map === EParametersMap.IMAGE);
    Page.Controls.setVisibility(controlId.A_DIFFUSION_RANGE, map !== EParametersMap.IMAGE);
    Page.Controls.setVisibility(controlId.B_DIFFUSION_RANGE, map !== EParametersMap.IMAGE);
    Page.Controls.setVisibility(controlId.INPUT_IMAGE_UPLOAD, map === EParametersMap.IMAGE);
    Page.Controls.setVisibility(controlId.DISPLAY_MODE_TABS, map === EParametersMap.IMAGE);
    Page.Controls.setVisibility(controlId.SHADING_TABS, displayMode === EDisplayMode.MONOCHROME);
};

function clearPreset(): void {
    Page.Select.setValue(controlId.PRESET_SELECT, null);
}
Page.Range.addObserver(controlId.A_FEEDING_RANGE, clearPreset);
Page.Range.addObserver(controlId.A_DIFFUSION_RANGE, clearPreset);
Page.Range.addObserver(controlId.B_KILLING_RANGE, clearPreset);
Page.Range.addObserver(controlId.B_DIFFUSION_RANGE, clearPreset);
// Page.Range.addObserver(controlId.SPEED_RANGE, clearPreset);
// Page.Tabs.addObserver(controlId.INITIAL_STATE_TABS, clearPreset);
// Page.Tabs.addObserver(controlId.SHADING_TABS, clearPreset);
// Page.Range.addObserver(controlId.ZOOM_RANGE, clearPreset);

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
        Page.Range.setValue(controlId.A_FEEDING_RANGE, value);
        Page.Range.storeState(controlId.A_FEEDING_RANGE);
        clearPreset();
    }
    public static get ADiffusionRate(): number {
        return Page.Range.getValue(controlId.A_DIFFUSION_RANGE);
    }
    public static get BKillingRate(): number {
        return Page.Range.getValue(controlId.B_KILLING_RANGE);
    }
    public static set BKillingRate(value: number) {
        Page.Range.setValue(controlId.B_KILLING_RANGE, value);
        Page.Range.storeState(controlId.B_KILLING_RANGE);
        clearPreset();
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

    public static get zoom(): number {
        return Page.Range.getValue(controlId.ZOOM_RANGE);
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

    public static get shading(): EShading {
        return Page.Tabs.getValues(controlId.SHADING_TABS)[0] as EShading;
    }
}

const callCanvasResizeObservers = () => { callObservers(Parameters.canvasResizeObservers); };
Page.Canvas.Observers.canvasResize.push(callCanvasResizeObservers);

const callResetObservers = () => { callObservers(Parameters.resetObservers); };
Page.Select.addObserver(controlId.PRESET_SELECT, callResetObservers);
Page.Button.addObserver(controlId.RESET_BUTTON, callResetObservers);
Page.Tabs.addObserver(controlId.PARAMETERS_MAP_TABS, callResetObservers);
Page.Tabs.addObserver(controlId.DISPLAY_MODE_TABS, callResetObservers);
Page.Tabs.addObserver(controlId.INITIAL_STATE_TABS, callResetObservers);
Parameters.imageUploadObservers.push(callResetObservers);

Page.Tabs.addObserver(controlId.PARAMETERS_MAP_TABS, () => {
    isInValuePickingMode = false;
    updateParametersVisibility();
});
Page.Tabs.addObserver(controlId.DISPLAY_MODE_TABS, updateParametersVisibility);
updateParametersVisibility();

const updateIndicatorsVisibility = () => {
    Page.Canvas.setIndicatorsVisibility(Page.Checkbox.isChecked(controlId.INDICATORS_CHECKBOX));
};
Page.Checkbox.addObserver(controlId.INDICATORS_CHECKBOX, updateIndicatorsVisibility);
updateIndicatorsVisibility();

Page.Button.addObserver(controlId.PICK_VALUES_BUTTON, () => {
    Page.Tabs.setValues(controlId.PARAMETERS_MAP_TABS, []);
    isInValuePickingMode = true;
    Page.Range.setValue(controlId.A_DIFFUSION_RANGE, 0.2097);
    Page.Range.setValue(controlId.B_DIFFUSION_RANGE, 0.1050);
    Page.Range.setValue(controlId.ZOOM_RANGE, 1);
    if (Parameters.speed < 30) {
        Page.Range.setValue(controlId.SPEED_RANGE, 30);
    }
    clearPreset();

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
    const url = `./resources/cat.jpg?v=${Page.version}`;
    Loader.registerLoadingObject(url);

    const defaultImage = new Image();
    defaultImage.addEventListener("load", () => {
        Loader.registerLoadedObject(url);

        for (const observer of Parameters.imageUploadObservers) {
            observer(defaultImage);
        }
    });
    defaultImage.src = url;
}

Page.FileControl.addDownloadObserver(controlId.IMAGE_DOWNLOAD, () => {
    callObservers(Parameters.imageDownloadObservers);
    callResetObservers();
});

function applyCurrentPreset(): void {
    if (Parameters.parametersMap === EParametersMap.UNIFORM) {
        const selectedPresetId = Page.Select.getValue(controlId.PRESET_SELECT);
        const preset = Presets[selectedPresetId];
        if (preset) {
            Page.Range.setValue(controlId.A_FEEDING_RANGE, preset.aFeeding);
            Page.Range.setValue(controlId.A_DIFFUSION_RANGE, preset.aDiffuse);
            Page.Range.setValue(controlId.B_KILLING_RANGE, preset.bKilling);
            Page.Range.setValue(controlId.B_DIFFUSION_RANGE, preset.bDiffuse);
            Page.Range.setValue(controlId.SPEED_RANGE, preset.speed);
            Page.Range.setValue(controlId.ZOOM_RANGE, preset.zoom);
            Page.Tabs.setValues(controlId.INITIAL_STATE_TABS, [preset.initialState]);
            Page.Tabs.setValues(controlId.SHADING_TABS, [preset.shading]);

            Page.Range.clearStoredState(controlId.A_FEEDING_RANGE);
            Page.Range.clearStoredState(controlId.A_DIFFUSION_RANGE);
            Page.Range.clearStoredState(controlId.B_KILLING_RANGE);
            Page.Range.clearStoredState(controlId.B_DIFFUSION_RANGE);
            Page.Range.clearStoredState(controlId.SPEED_RANGE);
            Page.Range.clearStoredState(controlId.ZOOM_RANGE);
            Page.Tabs.clearStoredState(controlId.INITIAL_STATE_TABS);
            Page.Tabs.clearStoredState(controlId.SHADING_TABS);
        }
    }
}
Page.Select.addObserver(controlId.PRESET_SELECT, () => {
    Parameters.exitValuePickingMode();
    applyCurrentPreset();
});
Page.Tabs.addObserver(controlId.PARAMETERS_MAP_TABS, applyCurrentPreset);
applyCurrentPreset();

// add fake observer to prevent touch events from moving viewport on touch devices
Page.Canvas.Observers.mouseDrag.push(() => { }); /* tslint:disable-line:no-empty */

export {
    Parameters,
};
