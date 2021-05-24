import { gl } from "./gl-utils/gl-canvas";
import { Parameters } from "./parameters";

const maxResolution = 512;
const hiddenCanvas = document.createElement("canvas");
const hiddenCanvasContext = hiddenCanvas.getContext("2d");

let currentImageData: ImageData;

function computeBrightness(r: number, g: number, b: number): number {
    return (0.21 * r) + (0.72 * g) + (0.07 * b);
}

function downsizeImageIfNeeded(image: HTMLImageElement): ImageData {
    const scalingFactor = Math.min(1, maxResolution / Math.max(image.width, image.height));
    const finalWidth = Math.ceil(scalingFactor * image.width);
    const finalHeight = Math.ceil(scalingFactor * image.height);

    hiddenCanvas.width = finalWidth;
    hiddenCanvas.height = finalHeight;
    hiddenCanvasContext.drawImage(image, 0, 0, finalWidth, finalHeight);

    const imageData = hiddenCanvasContext.getImageData(0, 0, hiddenCanvas.width, hiddenCanvas.height);
    const rawDataCopy = new Uint8ClampedArray(imageData.data);

    // revert vertically, and store brightness in alpha channel
    let i = 0;
    for (let iY = imageData.height - 1; iY >= 0; iY--) {
        for (let iX = 0; iX < imageData.width; iX++) {
            const r = rawDataCopy[4 * (iX + iY * imageData.width)];
            const g = rawDataCopy[4 * (iX + iY * imageData.width) + 1];
            const b = rawDataCopy[4 * (iX + iY * imageData.width) + 2];
            const brightness = computeBrightness(r, g, b);
            imageData.data[i++] = r;
            imageData.data[i++] = g;
            imageData.data[i++] = b;
            imageData.data[i++] = brightness;
        }
    }
    return imageData;
}

interface ITexture {
    id: WebGLTexture;
    width: number;
    height: number;
}

const currentTexture: ITexture = {
    id: null,
    width: -1,
    height: -1,
};

function uploadToGPU(): void {
    if (currentTexture.id !== null) {
        let data: Uint8ClampedArray;
        if (currentImageData) {
            data = currentImageData.data;
            currentTexture.width = currentImageData.width;
            currentTexture.height = currentImageData.height;
        } else {
            data = new Uint8ClampedArray([128, 128, 128, 128]);
            currentTexture.width = 1;
            currentTexture.height = 1;
        }

        gl.bindTexture(gl.TEXTURE_2D, currentTexture.id);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, currentTexture.width, currentTexture.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
}

Parameters.imageUploadObservers.push((image: HTMLImageElement) => {
    currentImageData = downsizeImageIfNeeded(image);
    uploadToGPU();
});

function getTexture(): ITexture {
    if (currentTexture.id === null) {
        currentTexture.id = gl.createTexture(); // initialize at last moment to ensure gl is loaded
        uploadToGPU();
    }

    return currentTexture;
}

export {
    getTexture,
};
