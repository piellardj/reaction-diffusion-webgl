import { gl } from "./gl-utils/gl-canvas";
import { Shader } from "./gl-utils/shader";
import * as ShaderManager from "./gl-utils/shader-manager";
import { VBO } from "./gl-utils/vbo";
import { EInitialState, EParametersMap, Parameters } from "./parameters";
import * as InputImage from "./input-image";
import { Texture } from "./texture";

class Engine {
    public static readonly A_FEEDING_MIN: number = 0.01;
    public static readonly A_FEEDING_MAX: number = 0.1;
    public static readonly B_KILLING_MIN: number = 0.045;
    public static readonly B_KILLING_MAX: number = 0.07;

    private displayShader: Shader;
    private updateUniformShader: Shader;
    private updateMapShader: Shader;
    private updateImageMapShader: Shader;
    private resetShader: Shader;
    private brushApplyShader: Shader;
    private brushDisplayShader: Shader;

    private readonly squareVBO: VBO;

    private previousTexture: Texture;
    private currentTexture: Texture;

    private initialized: boolean;
    private _iteration: number;
    private lastIterationUpdate: number;

    public constructor() {
        this.squareVBO = VBO.createQuad(gl, -1, -1, +1, +1);

        this.previousTexture = new Texture();
        this.currentTexture = new Texture();

        this.initialized = false;
        this.lastIterationUpdate = performance.now() - 5000;
        this.iteration = 0;

        this.asyncLoadShader("display", "fullscreen.vert", "display/display.frag", (shader: Shader) => { this.displayShader = shader; });
        this.asyncLoadShader("update", "fullscreen.vert", "update/update-uniform.frag", (shader: Shader) => { this.updateUniformShader = shader; });
        this.asyncLoadShader("update", "fullscreen.vert", "update/update-map.frag", (shader: Shader) => { this.updateMapShader = shader; },
            {
                A_FEEDING_MIN: Engine.A_FEEDING_MIN.toFixed(5),
                A_FEEDING_MAX: Engine.A_FEEDING_MAX.toFixed(5),
                B_KILLING_MIN: Engine.B_KILLING_MIN.toFixed(5),
                B_KILLING_MAX: Engine.B_KILLING_MAX.toFixed(5),
            });
        this.asyncLoadShader("update", "fullscreen.vert", "update/update-map-image.frag", (shader: Shader) => { this.updateImageMapShader = shader; });
        this.asyncLoadShader("reset", "fullscreen.vert", "update/reset.frag", (shader: Shader) => { this.resetShader = shader; });
        this.asyncLoadShader("brush-apply", "update/brush.vert", "update/brush-apply.frag", (shader: Shader) => { this.brushApplyShader = shader; });
        this.asyncLoadShader("brush-display", "update/brush.vert", "update/brush-display.frag", (shader: Shader) => { this.brushDisplayShader = shader; });
    }

    public initialize(width: number, height: number): void {
        this.previousTexture.reserveSpace(width, height);
        this.currentTexture.reserveSpace(width, height);
        this.initialized = false;
        this.iteration = 0;
    }

    public update(): void {
        if (!this.initialized) {
            this.initialized = this.reset();
        }

        this.handleBrush();

        if (this.initialized) {
            let updateShader: Shader;
            const map = Parameters.parametersMap;
            if (map === EParametersMap.UNIFORM && this.updateUniformShader) {
                this.updateUniformShader.u["uRates"].value = [
                    Parameters.AFeedingRate,
                    Parameters.BKillingRate,
                    Parameters.ADiffusionRate,
                    Parameters.BDIffusionRate,
                ];
                updateShader = this.updateUniformShader;
            } else if (map === EParametersMap.RANGE && this.updateMapShader) {
                this.updateMapShader.u["uRates"].value = [
                    Parameters.ADiffusionRate,
                    Parameters.BDIffusionRate,
                ];
                updateShader = this.updateMapShader;
            } else if (this.updateImageMapShader) {
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
                updateShader = this.updateImageMapShader;
            }

            if (updateShader) {
                updateShader.use();
                updateShader.bindAttributes();

                updateShader.u["uTexelSize"].value = [1 / this.previousTexture.width, 1 / this.previousTexture.height];

                const nbIterations = Parameters.speed;
                for (let i = nbIterations; i > 0; i--) {
                    this.swapTextures();

                    gl.bindFramebuffer(gl.FRAMEBUFFER, this.currentTexture.framebuffer);

                    updateShader.u["uPreviousIteration"].value = this.previousTexture.texture;
                    updateShader.bindUniforms();
                    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
                }
                this.iteration = this._iteration + nbIterations;
            }
        }
    }

    public reset(): boolean {
        if (this.resetShader) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.currentTexture.framebuffer);

            const pattern = Parameters.initialState;
            this.resetShader.u["uPattern"].value = [pattern === EInitialState.BLANK, pattern === EInitialState.DISC, pattern === EInitialState.CIRCLE, 0];

            this.resetShader.use();
            this.resetShader.bindUniformsAndAttributes();
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            return true;
        }
        return false;
    }

    public drawToCanvas(): void {
        if (this.displayShader) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);

            this.displayShader.u["uTexture"].value = this.currentTexture.texture;
            this.displayShader.use();
            this.displayShader.bindUniformsAndAttributes();

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

    private set iteration(i: number) {
        this._iteration = i;

        const now = performance.now();
        if (now - this.lastIterationUpdate > 200) {
            Page.Canvas.setIndicatorText("iteration-indicator", this._iteration.toString());
            this.lastIterationUpdate = now;
        }
    }

    private handleBrush(): void {
        const mousePosition = Page.Canvas.getMousePosition();
        if (mousePosition[0] >= 0 && mousePosition[0] <= 1 && mousePosition[1] >= 0 && mousePosition[1] <= 1) {
            const size = Parameters.brushSize;
            const position = [mousePosition[0], 1 - mousePosition[1]];
            const brushSize = [size / this.currentTexture.width, size / this.currentTexture.height];

            if (this.brushApplyShader) {
                this.brushApplyShader.u["uPosition"].value = position;
                this.brushApplyShader.u["uSize"].value = brushSize;
            }
            if (this.brushDisplayShader) {
                this.brushDisplayShader.u["uPosition"].value = position;
                this.brushDisplayShader.u["uSize"].value = brushSize;
            }

            if (this.brushApplyShader && Page.Canvas.isMouseDown()) {
                gl.bindFramebuffer(gl.FRAMEBUFFER, this.currentTexture.framebuffer);
                this.brushApplyShader.use();
                this.brushApplyShader.bindUniformsAndAttributes();
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            }
        }
    }

    private swapTextures(): void {
        const tmp = this.currentTexture;
        this.currentTexture = this.previousTexture;
        this.previousTexture = tmp;
    }

    private asyncLoadShader(name: string, vertexFilename: string, fragmentFilename: string, callback: (shader: Shader) => unknown, injected: any = {}): void {
        ShaderManager.buildShader({
            fragmentFilename,
            vertexFilename,
            injected,
        }, (builtShader: Shader | null) => {
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

