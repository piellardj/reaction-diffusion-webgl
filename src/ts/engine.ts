import { gl } from "./gl-utils/gl-canvas";
import { Shader } from "./gl-utils/shader";
import * as ShaderManager from "./gl-utils/shader-manager";
import { VBO } from "./gl-utils/vbo";
import { EInitialState, EParametersMap, Parameters } from "./parameters";

import { Texture } from "./texture";

class Engine {
    private displayShader: Shader;
    private updateShader: Shader;
    private resetShader: Shader;
    private brushApplyShader: Shader;
    private brushDisplayShader: Shader;

    private readonly squareVBO: VBO;

    private previousTexture: Texture;
    private currentTexture: Texture;

    private initialized: boolean;

    public constructor() {
        this.squareVBO = VBO.createQuad(gl, -1, -1, +1, +1);

        this.previousTexture = new Texture();
        this.currentTexture = new Texture();

        this.initialized = false;

        this.asyncLoadShader("display", "fullscreen.vert", "display/display.frag", (shader: Shader) => { this.displayShader = shader; });
        this.asyncLoadShader("update", "fullscreen.vert", "update/update.frag", (shader: Shader) => { this.updateShader = shader; });
        this.asyncLoadShader("reset", "fullscreen.vert", "update/reset.frag", (shader: Shader) => { this.resetShader = shader; });
        this.asyncLoadShader("brush-apply", "update/brush.vert", "update/brush-apply.frag", (shader: Shader) => { this.brushApplyShader = shader; });
        this.asyncLoadShader("brush-display", "update/brush.vert", "update/brush-display.frag", (shader: Shader) => { this.brushDisplayShader = shader; });
    }

    public initialize(width: number, height: number): void {
        this.previousTexture.reserveSpace(width, height);
        this.currentTexture.reserveSpace(width, height);
        this.initialized = false;
    }

    public update(): void {
        if (!this.initialized) {
            this.initialized = this.reset();
        }

        this.handleBrush();

        if (this.initialized && this.updateShader) {
            this.updateShader.use();
            this.updateShader.bindAttributes();

            this.updateShader.u["uTexelSize"].value = [1 / this.previousTexture.width, 1 / this.previousTexture.height];
            this.updateShader.u["uRates"].value = [
                Parameters.AFeedingRate,
                Parameters.BKillingRate,
                Parameters.ADiffusionRate,
                Parameters.BDIffusionRate,
            ];

            for (let i = Parameters.speed; i > 0; i--) {
                this.swapTextures();

                gl.bindFramebuffer(gl.FRAMEBUFFER, this.currentTexture.framebuffer);

                this.updateShader.u["uTexture"].value = this.previousTexture.texture;
                this.updateShader.u["uRangeParameters"].value = Parameters.parametersMap === EParametersMap.RANGE ? 1 : 0;
                this.updateShader.bindUniforms();
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
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

    private asyncLoadShader(name: string, vertexFilename: string, fragmentFilename: string, callback: (shader: Shader) => unknown): void {
        ShaderManager.buildShader({
            fragmentFilename,
            vertexFilename,
            injected: {},
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

