#include "update/_reaction-diffusion.frag"

uniform sampler2D uImageMapTexture;
uniform vec2 uImageMapScaling;

void main() {
    vec2 scaledSamplingPosition = 0.5 + (vSamplingPosition - 0.5) * uImageMapScaling;
    float inImageMap = step(0.0, scaledSamplingPosition.x) * step(scaledSamplingPosition.x, 1.0) *
        step(0.0, scaledSamplingPosition.y) * step(scaledSamplingPosition.y, 1.0);

    float mapValue = texture2D(uImageMapTexture, scaledSamplingPosition).a * inImageMap;
    mapValue = sqrt(clamp(mapValue - 0.1, 0.0, 1.0));

    float feedA = mix(0.02220, 0.04470, mapValue);
    float killB = mix(0.06516, 0.05789, mapValue);
    float diffuseA = 0.210;
    float diffuseB = 0.105;

    gl_FragColor = computeNewValue(feedA, killB, diffuseA, diffuseB);
}