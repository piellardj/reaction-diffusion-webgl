import * as fs from "fs";
import * as fse from "fs-extra";
import * as path from "path";
import { Demopage } from "webpage-templates";

const data = {
    title: "Reaction-diffusion",
    description: "Reaction-diffusion in WebGL",
    introduction: [
        "INTRO",
    ],
    githubProjectName: "reaction-diffusion-webgl",
    additionalLinks: [],
    styleFiles: [],
    scriptFiles: [
        "script/main.min.js"
    ],
    indicators: [
        {
            id: "fps-indicator",
            label: "FPS",
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
                            checked: true,
                        },
                        {
                            value: "range",
                            label: "Range",
                        },
                    ]
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
                    value: 10,
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
                            label: "Circle",
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
