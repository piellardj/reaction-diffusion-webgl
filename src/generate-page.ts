import * as fs from "fs";
import * as fse from "fs-extra";
import * as path from "path";
import { Demopage } from "webpage-templates";

const data = {
    title: "Reaction-diffusion",
    description: "Reaction-diffusion on GPU in WebGL",
    introduction: [
        "Reaction-diffusion is a model used to simulate the interaction of two chemical substances 'A' and 'B'. 'A' transforms into 'B' when it is in contact with it. Additionally, a little 'A' is continuously injected, and a fraction of 'B' slowly destroys itself.",
        "This is a GPU implementation of the Gray Scott model. It exhibits natural-looking patterns, reminiscent of corals or some animal coats. Use the left mouse button to interact with the simulation.",
    ],
    githubProjectName: "reaction-diffusion-webgl",
    additionalLinks: [],
    styleFiles: [
        "css/main.css"
    ],
    scriptFiles: [
        "script/main.min.js"
    ],
    indicators: [
        {
            id: "fps-indicator",
            label: "FPS",
        },
        {
            id: "iteration-indicator",
            label: "Iteration",
        },
    ],
    canvas: {
        width: 512,
        height: 512,
        enableFullscreen: true,
    },
    controlsSections: [
        {
            title: "Parameters",
            controls: [
                {
                    type: Demopage.supportedControls.Tabs,
                    title: "Map",
                    id: "map-tabs-id",
                    unique: true,
                    options: [
                        {
                            value: "uniform",
                            label: "Uniform",
                        },
                        {
                            value: "image",
                            label: "Image",
                            checked: true,
                        },
                    ]
                },
                {
                    type: Demopage.supportedControls.Range,
                    title: "Patterns scale",
                    id: "pattern-scale-range-id",
                    min: 1,
                    max: 3,
                    value: 1,
                    step: 0.05
                },
                {
                    type: Demopage.supportedControls.FileUpload,
                    id: "input-image-upload-button",
                    accept: [".png", ".jpg", ".bmp", ".webp"],
                    defaultMessage: "Upload an image"
                },
                {
                    type: Demopage.supportedControls.Range,
                    title: "A feeding",
                    id: "A-feeding-range-id",
                    min: 0,
                    max: 0.1,
                    value: 0.054,
                    step: 0.001
                },
                {
                    type: Demopage.supportedControls.Range,
                    title: "A diffusion",
                    id: "A-diffusion-range-id",
                    min: 0,
                    max: 0.5,
                    value: 0.2097,
                    step: 0.001
                },
                {
                    type: Demopage.supportedControls.Range,
                    title: "B killing",
                    id: "B-killing-range-id",
                    min: 0,
                    max: 0.1,
                    value: 0.0620,
                    step: 0.001
                },
                {
                    type: Demopage.supportedControls.Range,
                    title: "B diffusion",
                    id: "B-diffusion-range-id",
                    min: 0,
                    max: 0.5,
                    value: 0.1050,
                    step: 0.001
                },
                {
                    type: Demopage.supportedControls.Button,
                    id: "pick-values-button-id",
                    label: "Pick values"
                },
                {
                    type: Demopage.supportedControls.Button,
                    id: "reset-values-button-id",
                    label: "Reset values"
                }
            ]
        },
        {
            title: "Simulation",
            controls: [
                {
                    type: Demopage.supportedControls.Range,
                    title: "Speed",
                    id: "speed-range-id",
                    min: 0,
                    max: 100,
                    value: 20,
                    step: 1
                },
                {
                    type: Demopage.supportedControls.Range,
                    title: "Brush size",
                    id: "brush-size-range-id",
                    min: 20,
                    max: 100,
                    value: 30,
                    step: 1
                },
                {
                    type: Demopage.supportedControls.Checkbox,
                    title: "Display brush",
                    id: "brush-display-checkbox-id",
                    checked: false,
                },
                {
                    type: Demopage.supportedControls.Tabs,
                    title: "Initial state",
                    id: "initial-state-tabs-id",
                    unique: true,
                    options: [
                        {
                            value: "blank",
                            label: "Blank",
                        },
                        {
                            value: "disc",
                            label: "Disc",
                        },
                        {
                            value: "circle",
                            label: "Circles",
                            checked: true,
                        },
                    ]
                },
                {
                    type: Demopage.supportedControls.Button,
                    id: "reset-button-id",
                    label: "Reset"
                }
            ]
        },
        {
            title: "Display",
            controls: [
                {
                    type: Demopage.supportedControls.Tabs,
                    title: "Mode",
                    id: "display-mode-tabs-id",
                    unique: true,
                    options: [
                        {
                            value: "monochrome",
                            label: "Monochrome",
                            checked: true,
                        },
                        {
                            value: "tricolor",
                            label: "Tricolor",
                        },
                    ]
                },
                {
                    type: Demopage.supportedControls.Checkbox,
                    title: "Indicators",
                    id: "indicators-checkbox-id",
                    checked: false,
                },
            ]
        },
        {
            title: "Output",
            controls: [
                {
                    type: Demopage.supportedControls.FileDownload,
                    id: "image-download-id",
                    label: "Download image"
                }
            ]
        }
    ]
};

const SRC_DIR = path.resolve(__dirname);
const DEST_DIR = path.resolve(__dirname, "..", "docs");
const minified = true;

const buildResult = Demopage.build(data, DEST_DIR, {
    debug: !minified,
});

// disable linting on this file because it is generated
buildResult.pageScriptDeclaration = "/* tslint:disable */\n" + buildResult.pageScriptDeclaration;

const SCRIPT_DECLARATION_FILEPATH = path.join(SRC_DIR, "ts", "page-interface-generated.ts");
fs.writeFileSync(SCRIPT_DECLARATION_FILEPATH, buildResult.pageScriptDeclaration);

fse.copySync(path.join(SRC_DIR, "static"), path.join(DEST_DIR));
