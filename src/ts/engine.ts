import { gl } from "./gl-utils/gl-canvas";
import { Shader } from "./gl-utils/shader";
import * as ShaderManager from "./gl-utils/shader-manager";
import { VBO } from "./gl-utils/vbo";

class Engine {
    private drawToCanvasShader: Shader;
    private readonly fullscreenVBO: VBO;

    public constructor() {
        this.fullscreenVBO = VBO.createQuad(gl, -1, -1, +1, +1);

        Engine.asyncLoadShader("display", "display.vert", "display.frag", (shader: Shader) => {
            this.drawToCanvasShader = shader;
            this.drawToCanvasShader.a["aCorner"].VBO = this.fullscreenVBO;
        });
    }

    public update(): void {
    }

    public drawToCanvas(): void {
        if (this.drawToCanvasShader) {
            this.drawToCanvasShader.use();
            this.drawToCanvasShader.bindAttributes();
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
    }

    private static asyncLoadShader(name: string, vertexFilename: string, fragmentFilename: string, callback: (shader: Shader) => unknown): void {
        ShaderManager.buildShader({
            fragmentFilename,
            vertexFilename,
            injected: {},
        }, (builtShader: Shader | null) => {
            if (builtShader !== null) {
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

