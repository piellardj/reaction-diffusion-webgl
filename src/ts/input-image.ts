import { Parameters } from "./parameters";
import { ImageTexture } from "./texture/image-texture";


const maxResolution = 512;
const hiddenCanvas = document.createElement("canvas");
const hiddenCanvasContext = hiddenCanvas.getContext("2d");

let currentImageData: ImageData;
let currentTexture: ImageTexture = null;

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

Parameters.imageUploadObservers.push((image: HTMLImageElement) => {
    currentImageData = downsizeImageIfNeeded(image);
    if (currentTexture !== null) {
        currentTexture.uploadDataToGPU(currentImageData);
    }
});

function getTexture(): ImageTexture {
    if (currentTexture === null) {
        currentTexture = new ImageTexture(currentImageData);
    }

    return currentTexture;
}

export {
    getTexture,
};
