import { gl } from "./gl-utils/gl-canvas";
import { Shader } from "./gl-utils/shader";
import * as ShaderManager from "./gl-utils/shader-manager";
import { VBO } from "./gl-utils/vbo";
import { Parameters } from "./parameters";

import { Texture } from "./texture";

class Engine {
    private displayShader: Shader;
    private updateShader: Shader;
    private resetShader: Shader;

    private readonly fullscreenVBO: VBO;

    private previousTexture: Texture;
    private currentTexture: Texture;

    private initialized: boolean;

    public constructor() {
        this.fullscreenVBO = VBO.createQuad(gl, -1, -1, +1, +1);

        this.previousTexture = new Texture();
        this.currentTexture = new Texture();

        this.initialized = false;

        this.asyncLoadShader("display", "display/display.frag", (shader: Shader) => { this.displayShader = shader; });
        this.asyncLoadShader("update", "update/update.frag", (shader: Shader) => { this.updateShader = shader; });
        this.asyncLoadShader("reset", "update/reset.frag", (shader: Shader) => { this.resetShader = shader; });
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
                this.updateShader.bindUniforms();
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            }
        }
    }

    public reset(): boolean {
        if (this.resetShader) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.currentTexture.framebuffer);
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

    private swapTextures(): void {
        const tmp = this.currentTexture;
        this.currentTexture = this.previousTexture;
        this.previousTexture = tmp;
    }

    private asyncLoadShader(name: string, fragmentFilename: string, callback: (shader: Shader) => unknown): void {
        ShaderManager.buildShader({
            fragmentFilename,
            vertexFilename: "fullscreen.vert",
            injected: {},
        }, (builtShader: Shader | null) => {
            if (builtShader !== null) {
                builtShader.a["aCorner"].VBO = this.fullscreenVBO;
                callback(builtShader);
            } else {
                Page.Demopage.setErrorMessage(`${name}-shader-error`, `Faild to build '${name}' shader.`);
            }
        });
    }
}

export {
    Engine,
};

