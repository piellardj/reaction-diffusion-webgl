enum EParametersMap {
    UNIFORM = "uniform",
    VALUE_PICKING = "value_picking", // technical, not defined in the control
    IMAGE = "image",
}

enum EInitialState {
    BLANK = "blank",
    DISC = "disc",
    CIRCLE = "circle",
}

enum EDisplayMode {
    MONOCHROME = "monochrome",
    TRICOLOR = "tricolor",
}

enum EShading {
    BINARY = "binary",
    GREYSCALE = "greyscale",
    COLORSCALE = "colorscale",
}

export {
    EDisplayMode,
    EInitialState,
    EShading,
    EParametersMap,
};
