import { RenderToTexture } from "./render-to-texture";


class RenderToTextureSwapable {
    private previousTexture: RenderToTexture;
    private currentTexture: RenderToTexture;

    public constructor() {
        this.previousTexture = new RenderToTexture();
        this.currentTexture = new RenderToTexture();
    }

    public get previous(): WebGLTexture {
        return this.previousTexture.texture;
    }
    public get current(): WebGLTexture {
        return this.currentTexture.texture;
    }
    public get currentFramebuffer(): WebGLFramebuffer {
        return this.currentTexture.framebuffer;
    }

    public get width(): number {
        return this.previousTexture.width;
    }
    public get height(): number {
        return this.previousTexture.height;
    }


    public reserveSpace(width: number, height: number): void {
        this.previousTexture.reserveSpace(width, height);
        this.currentTexture.reserveSpace(width, height);
    }

    public swap(): void {
        const tmp = this.currentTexture;
        this.currentTexture = this.previousTexture;
        this.previousTexture = tmp;
    }
}

export {
    RenderToTextureSwapable,
};
