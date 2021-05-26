import { gl } from "../gl-utils/gl-canvas";

const defaultImageData: ImageData = {
    data: new Uint8ClampedArray([128, 128, 128, 128]),
    width: 1,
    height: 1,
};

class ImageTexture {
    public readonly id: WebGLTexture;
    private _width: number = -1;
    private _height: number = -1;

    public constructor(image?: ImageData) {
        this.id = gl.createTexture();

        this.uploadToGPU(image ?? defaultImageData);
    }

    public uploadToGPU(image: ImageData): void {
        this._width = image.width;
        this._height = image.height;

        gl.bindTexture(gl.TEXTURE_2D, this.id);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, image.width, image.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, image.data);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    public get width(): number {
        return this._width;
    }
    public get height(): number {
        return this._height;
    }
}

export {
    ImageTexture,
};
