import { gl } from "./gl-utils/gl-canvas";
import { Shader } from "./gl-utils/shader";
import * as ShaderManager from "./gl-utils/shader-manager";
import { VBO } from "./gl-utils/vbo";
import { EDisplayMode, EInitialState, EParametersMap, Parameters } from "./parameters";
import * as InputImage from "./input-image";
import { RenderToTextureSwapable } from "./render-to-texture-swapable";
import * as Loader from "./loader";


class Engine {
    public static readonly A_FEEDING_MIN: number = 0.01;
    public static readonly A_FEEDING_MAX: number = 0.1;
    public static readonly B_KILLING_MIN: number = 0.045;
    public static readonly B_KILLING_MAX: number = 0.07;

    private displayMonochromeShader: Shader;
    private displayTricolorShader: Shader;

    private updateUniformShader: Shader;
    private updateMapShader: Shader;
    private updateImageMapShader: Shader;

    private resetShader: Shader;
    private brushApplyShader: Shader;
    private brushDisplayShader: Shader;

    private readonly squareVBO: VBO;

    // first one is used for monochrome or red
    // second one is used for green
    // thrid one is used for blue
    private readonly internalTextures: [RenderToTextureSwapable, RenderToTextureSwapable, RenderToTextureSwapable]; // used for monochrome or red

    private initialized: boolean;
    private _iteration: number;
    private lastIterationUpdate: number;

    public constructor() {
        this.squareVBO = VBO.createQuad(gl, -1, -1, +1, +1);

        this.internalTextures = [
            new RenderToTextureSwapable(),
            new RenderToTextureSwapable(),
            new RenderToTextureSwapable(),
        ];

        this.initialized = false;
        this.lastIterationUpdate = performance.now() - 5000;
        this.iteration = 0;

        this.asyncLoadShader("display-monochrome", "fullscreen.vert", "display/display-monochrome.frag", (shader: Shader) => { this.displayMonochromeShader = shader; });
        this.asyncLoadShader("display-tricolor", "fullscreen.vert", "display/display-tricolor.frag", (shader: Shader) => { this.displayTricolorShader = shader; });
        this.asyncLoadShader("update-uniform", "fullscreen.vert", "update/update-uniform.frag", (shader: Shader) => { this.updateUniformShader = shader; });
        this.asyncLoadShader("update-map", "fullscreen.vert", "update/update-map.frag", (shader: Shader) => { this.updateMapShader = shader; },
            {
                A_FEEDING_MIN: Engine.A_FEEDING_MIN.toFixed(5),
                A_FEEDING_MAX: Engine.A_FEEDING_MAX.toFixed(5),
                B_KILLING_MIN: Engine.B_KILLING_MIN.toFixed(5),
                B_KILLING_MAX: Engine.B_KILLING_MAX.toFixed(5),
            });
        this.asyncLoadShader("update-image", "fullscreen.vert", "update/update-map-image.frag", (shader: Shader) => { this.updateImageMapShader = shader; });
        this.asyncLoadShader("reset", "fullscreen.vert", "update/reset.frag", (shader: Shader) => { this.resetShader = shader; });
        this.asyncLoadShader("brush-apply", "update/brush.vert", "update/brush-apply.frag", (shader: Shader) => { this.brushApplyShader = shader; });
        this.asyncLoadShader("brush-display", "update/brush.vert", "update/brush-display.frag", (shader: Shader) => { this.brushDisplayShader = shader; });
    }

    public initialize(width: number, height: number): void {
        for (const texture of this.internalTextures) {
            texture.reserveSpace(width, height);
        }
        this.initialized = false;
        this.iteration = 0;
    }

    public update(): void {
        if (!this.initialized) {
            this.initialized = this.reset();
        }

        this.handleBrush();

        if (this.initialized) {
            const nbIterations = Parameters.speed;
            const map = Parameters.parametersMap;

            if (map === EParametersMap.IMAGE) {
                if (this.updateImageMapShader) {
                    const inputImageTexture = InputImage.getTexture();
                    this.updateImageMapShader.u["uImageMapTexture"].value = inputImageTexture.id;

                    const canvasAspectRatio = Page.Canvas.getAspectRatio();
                    const imageAspectRatio = inputImageTexture.width / inputImageTexture.height;
                    if (canvasAspectRatio > imageAspectRatio) {
                        this.updateImageMapShader.u["uImageMapScaling"].value = [canvasAspectRatio / imageAspectRatio, 1];
                    } else {
                        this.updateImageMapShader.u["uImageMapScaling"].value = [1, imageAspectRatio / canvasAspectRatio];
                    }

                    this.updateImageMapShader.u["uDiffuseScaling"].value = Parameters.patternsScale;

                    this.updateImageMapShader.use();
                    this.updateImageMapShader.bindAttributes();
                    this.updateImageMapShader.u["uTexelSize"].value = [1 / this.internalTextures[0].width, 1 / this.internalTextures[0].height];

                    if (Parameters.displayMode === EDisplayMode.MONOCHROME) {
                        this.updateImageMapShader.u["uSampledChannel"].value = [0, 0, 0, 1];
                        this.updateInternal(this.updateImageMapShader, nbIterations, this.internalTextures[0]);
                    } else {
                        const splitNbIterations = Math.ceil(nbIterations / 3);
                        this.updateImageMapShader.u["uSampledChannel"].value = [1, 0, 0, 0];
                        this.updateInternal(this.updateImageMapShader, splitNbIterations, this.internalTextures[0]);

                        this.updateImageMapShader.u["uSampledChannel"].value = [0, 1, 0, 0];
                        this.updateInternal(this.updateImageMapShader, splitNbIterations, this.internalTextures[1]);

                        this.updateImageMapShader.u["uSampledChannel"].value = [0, 0, 1, 0];
                        this.updateInternal(this.updateImageMapShader, splitNbIterations, this.internalTextures[2]);
                    }
                }
            } else {
                let updateShader: Shader;

                if (map === EParametersMap.UNIFORM) {
                    if (this.updateUniformShader) {
                        this.updateUniformShader.u["uRates"].value = [
                            Parameters.AFeedingRate,
                            Parameters.BKillingRate,
                            Parameters.ADiffusionRate,
                            Parameters.BDIffusionRate,
                        ];
                        updateShader = this.updateUniformShader;
                    }
                } else if (map === EParametersMap.VALUE_PICKING) {
                    if (this.updateMapShader) {
                        this.updateMapShader.u["uRates"].value = [
                            Parameters.ADiffusionRate,
                            Parameters.BDIffusionRate,
                        ];
                        updateShader = this.updateMapShader;
                    }
                }

                if (updateShader) {
                    updateShader.use();
                    updateShader.bindAttributes();
                    updateShader.u["uTexelSize"].value = [1 / this.internalTextures[0].width, 1 / this.internalTextures[0].height];
                    this.updateInternal(updateShader, nbIterations, this.internalTextures[0]);
                }
            }
        }
    }

    public reset(): boolean {
        if (this.resetShader) {

            const pattern = Parameters.initialState;
            this.resetShader.u["uPattern"].value = [pattern === EInitialState.BLANK, pattern === EInitialState.DISC, pattern === EInitialState.CIRCLE, 0];

            this.resetShader.use();
            this.resetShader.bindUniformsAndAttributes();

            for (const texture of this.internalTextures) {
                gl.bindFramebuffer(gl.FRAMEBUFFER, texture.currentFramebuffer);
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            }
            return true;
        }
        return false;
    }

    public drawToCanvas(): void {
        let shader: Shader;

        const displayMode = Parameters.displayMode;
        if (displayMode === EDisplayMode.MONOCHROME) {
            if (this.displayMonochromeShader) {
                this.displayMonochromeShader.u["uTexture"].value = this.internalTextures[0].current;
                shader = this.displayMonochromeShader;
            }
        } else if (displayMode === EDisplayMode.TRICOLOR) {
            if (this.displayTricolorShader) {
                this.displayTricolorShader.u["uTextureRed"].value = this.internalTextures[0].current;
                this.displayTricolorShader.u["uTextureGreen"].value = this.internalTextures[1].current;
                this.displayTricolorShader.u["uTextureBlue"].value = this.internalTextures[2].current;
                shader = this.displayTricolorShader;
            }
        }

        if (shader) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            shader.use();
            shader.bindUniformsAndAttributes();
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
    }

    public displayBrush(): void {
        if (this.brushDisplayShader) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            this.brushDisplayShader.use();
            this.brushDisplayShader.bindUniformsAndAttributes();
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
    }

    private updateInternal(shader: Shader, nbIterations: number, texture: RenderToTextureSwapable): void {
        for (let i = nbIterations; i > 0; i--) {
            texture.swap();

            gl.bindFramebuffer(gl.FRAMEBUFFER, texture.currentFramebuffer);
            shader.u["uPreviousIteration"].value = texture.previous;
            shader.bindUniforms();
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
        this.iteration = this._iteration + nbIterations;
    }

    private set iteration(i: number) {
        this._iteration = i;

        const now = performance.now();
        if (now - this.lastIterationUpdate > 200) {
            Page.Canvas.setIndicatorText("iteration-indicator", this._iteration.toString());
            this.lastIterationUpdate = now;
        }
    }

    private handleBrush(): void {
        if (Parameters.parametersMap !== EParametersMap.VALUE_PICKING) {
            const mousePosition = Page.Canvas.getMousePosition();
            if (mousePosition[0] >= 0 && mousePosition[0] <= 1 && mousePosition[1] >= 0 && mousePosition[1] <= 1) {
                const size = Parameters.brushSize;
                const position = [mousePosition[0], 1 - mousePosition[1]];
                const brushSize = [size / this.internalTextures[0].width, size / this.internalTextures[1].height];

                if (this.brushApplyShader) {
                    this.brushApplyShader.u["uPosition"].value = position;
                    this.brushApplyShader.u["uSize"].value = brushSize;
                }
                if (this.brushDisplayShader) {
                    this.brushDisplayShader.u["uPosition"].value = position;
                    this.brushDisplayShader.u["uSize"].value = brushSize;
                }

                if (this.brushApplyShader && Page.Canvas.isMouseDown()) {
                    this.brushApplyShader.use();
                    this.brushApplyShader.bindUniformsAndAttributes();

                    for (const texture of this.internalTextures) {
                        gl.bindFramebuffer(gl.FRAMEBUFFER, texture.currentFramebuffer);
                        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
                    }
                }
            }
        }
    }

    private asyncLoadShader(name: string, vertexFilename: string, fragmentFilename: string, callback: (shader: Shader) => unknown, injected: any = {}): void {
        const id = `shader-${name}`;
        Loader.registerLoadingObject(id);

        ShaderManager.buildShader({
            fragmentFilename,
            vertexFilename,
            injected,
        }, (builtShader: Shader | null) => {
            Loader.registerLoadedObject(id);

            if (builtShader !== null) {
                builtShader.a["aCorner"].VBO = this.squareVBO;
                callback(builtShader);
            } else {
                Page.Demopage.setErrorMessage(`${name}-shader-error`, `Failed to build '${name}' shader.`);
            }
        });
    }
}

export {
    Engine,
};

