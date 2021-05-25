#include "update/_reaction-diffusion.frag"

uniform sampler2D uImageMapTexture;
uniform vec4 uSampledChannel;
uniform vec2 uImageMapScaling;
uniform float uDiffuseScaling;

void main() {
    vec2 scaledSamplingPosition = 0.5 + (vSamplingPosition - 0.5) * uImageMapScaling;
    float inImageMap = step(0.0, scaledSamplingPosition.x) * step(scaledSamplingPosition.x, 1.0) *
        step(0.0, scaledSamplingPosition.y) * step(scaledSamplingPosition.y, 1.0);

    float mapValue = dot(uSampledChannel, texture2D(uImageMapTexture, scaledSamplingPosition)) * inImageMap;
    mapValue = sqrt(clamp(mapValue - 0.1, 0.0, 1.0));

    float feedA = mix(0.02220, 0.04470, mapValue);
    float killB = mix(0.06516, 0.05789, mapValue);
    float diffuseA = 0.210;
    float diffuseB = 0.105;

    gl_FragColor = computeNewValue(feedA, killB, uDiffuseScaling * diffuseA, uDiffuseScaling * diffuseB);
}