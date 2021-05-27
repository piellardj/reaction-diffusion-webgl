import { EInitialState, EShading } from "./enums";

interface IPreset {
    aFeeding: number;
    aDiffuse: number;
    bKilling: number;
    bDiffuse: number;
    speed: number;
    zoom: number;
    initialState: EInitialState;
    shading: EShading;
}

const presets: { [id: string]: IPreset } = {
    "0": { // tiny waves
        aFeeding: 0.015,
        aDiffuse: 0.210,
        bKilling: 0.049,
        bDiffuse: 0.105,
        speed: 8,
        zoom: 3,
        initialState: EInitialState.DISC,
        shading: EShading.COLORSCALE,
    },
    "1": { // lines
        aFeeding: 0.037,
        aDiffuse: 0.500,
        bKilling: 0.059,
        bDiffuse: 0.342,
        speed: 100,
        zoom: 1,
        initialState: EInitialState.CIRCLE,
        shading: EShading.BINARY,
    },
    "2": { // orthogonal
        aFeeding: 0.058,
        aDiffuse: 0.210,
        bKilling: 0.063,
        bDiffuse: 0.105,
        speed: 60,
        zoom: 1,
        initialState: EInitialState.CIRCLE,
        shading: EShading.GREYSCALE,
    },
    "3": { // shimmer
        aFeeding: 0.021,
        aDiffuse: 0.210,
        bKilling: 0.056,
        bDiffuse: 0.105,
        speed: 10,
        zoom: 2,
        initialState: EInitialState.CIRCLE,
        shading: EShading.COLORSCALE,
    },
    "4": { // geometric
        aFeeding: 0.049,
        aDiffuse: 0.210,
        bKilling: 0.061,
        bDiffuse: 0.105,
        speed: 40,
        zoom: 1,
        initialState: EInitialState.CIRCLE,
        shading: EShading.GREYSCALE,
    },
    "5": { // holes
        aFeeding: 0.041,
        aDiffuse: 0.210,
        bKilling: 0.059,
        bDiffuse: 0.130,
        speed: 80,
        zoom: 1,
        initialState: EInitialState.DISC,
        shading: EShading.COLORSCALE,
    },
    "6": { // epilepsy
        aFeeding: 0.022,
        aDiffuse: 0.210,
        bKilling: 0.049,
        bDiffuse: 0.105,
        speed: 10,
        zoom: 1,
        initialState: EInitialState.CIRCLE,
        shading: EShading.GREYSCALE,
    },
};

export {
    IPreset,
    presets as Presets,
};
