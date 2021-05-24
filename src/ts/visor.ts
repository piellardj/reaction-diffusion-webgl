import { Engine } from "./engine";
import "./page-interface-generated";
import { EParametersMap, Parameters } from "./parameters";

enum EBarDirection {
    HORIZONTAL = "horizontal",
    VERTICAL = "vertical",
}

interface IBar {
    container: HTMLElement;
    legendContainer: HTMLElement;
    legendValue: HTMLSpanElement;
}

class Visor {
    private readonly horizontalLine: IBar;
    private readonly verticalLine: IBar;

    public constructor() {
        const container = Page.Canvas.getCanvasContainer();

        this.horizontalLine = Visor.createBar(EBarDirection.HORIZONTAL, "A feeding rate");
        container.appendChild(this.horizontalLine.container);

        this.verticalLine = Visor.createBar(EBarDirection.VERTICAL, "B killing rate");
        container.appendChild(this.verticalLine.container);
    }

    public update(): void {
        const mousePosition = Page.Canvas.getMousePosition();
        const isVisible = (Parameters.parametersMap === EParametersMap.RANGE) && Visor.isInRange(0, 1, mousePosition[0]) && Visor.isInRange(0, 1, mousePosition[1]);

        if (isVisible) {
            this.horizontalLine.legendValue.textContent = Visor.toString(Visor.interpolate(Engine.A_FEEDING_MIN, Engine.A_FEEDING_MAX, mousePosition[0]), 5);
            this.verticalLine.legendValue.textContent = Visor.toString(Visor.interpolate(Engine.B_KILLING_MIN, Engine.B_KILLING_MAX, mousePosition[1]), 5);

            const canvasSize = Page.Canvas.getSize();
            const hPixel = Math.round(mousePosition[0] * canvasSize[0]);
            const vPixel = Math.round(mousePosition[1] * canvasSize[1]);
            this.horizontalLine.container.style.left = `${hPixel}px`;
            {
                const legendBox = this.horizontalLine.legendContainer.getBoundingClientRect();
                const size = legendBox.width;
                if (hPixel - 0.5 * size < 0) {
                    this.horizontalLine.legendContainer.style.left = `${0.5 * size - hPixel}px`;
                } else if (hPixel + 0.5 * size > canvasSize[0]) {
                    this.horizontalLine.legendContainer.style.left = `${canvasSize[0] - (hPixel + 0.5 * size)}px`;
                } else {
                    this.horizontalLine.legendContainer.style.left = "";
                }
            }

            this.verticalLine.container.style.top = `${vPixel}px`;
            {
                const legendBox = this.verticalLine.legendContainer.getBoundingClientRect();
                const size = legendBox.height;
                if (vPixel - 0.5 * size < 0) {
                    this.verticalLine.legendContainer.style.top = `${0.5 * size - vPixel}px`;
                } else if (vPixel + 0.5 * size > canvasSize[1]) {
                    this.verticalLine.legendContainer.style.top = `${canvasSize[1] - (vPixel + 0.5 * size)}px`;
                } else {
                    this.verticalLine.legendContainer.style.top = "";
                }
            }
        }

        const display = isVisible ? "" : "none";
        this.horizontalLine.container.style.display = display;
        this.verticalLine.container.style.display = display;
    }

    private static createBar(direction: EBarDirection, label: string): IBar {
        const container = document.createElement("div");
        container.classList.add("visor-bar");
        container.classList.add(direction);
        container.style.display = "none";

        const legendContainer = document.createElement("div");
        legendContainer.classList.add("visor-bar-legend");

        const labelElement = document.createElement("span");
        labelElement.textContent = label;
        legendContainer.appendChild(labelElement);
        legendContainer.appendChild(document.createElement("br"));
        const legendValue = document.createElement("span");
        legendValue.textContent = "?";
        legendContainer.appendChild(legendValue);

        container.appendChild(legendContainer);

        return {
            container,
            legendContainer,
            legendValue,
        };
    }

    private static interpolate(a: number, b: number, x: number): number {
        return b * x + a * (1 - x);
    }

    private static isInRange(min: number, max: number, x: number): boolean {
        return min <= x && x <= max;
    }

    private static toString(x: number, maxDigits: number): string {
        const raw = x.toString();
        const dotIndex = raw.indexOf(".");
        if (dotIndex < 0) {
            return raw;
        } else {
            const nbDigits = Math.min(maxDigits, raw.length - (dotIndex + 1));
            return raw.substring(0, dotIndex + 1 + nbDigits);
        }
    }
}

export {
    Visor,
};
