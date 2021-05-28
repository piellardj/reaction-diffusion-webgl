#include "update/_reaction-diffusion.frag"

uniform sampler2D uImageMapTexture;
uniform vec4 uSampledChannel;
uniform float uDiffuseScaling;

void main() {
    float mapValue = dot(uSampledChannel, texture2D(uImageMapTexture, vSamplingPosition));
    mapValue = sqrt(clamp(mapValue - 0.1, 0.0, 1.0));

    float feedA = mix(0.02220, 0.04470, mapValue);
    float killB = mix(0.06516, 0.05789, mapValue);
    float diffuseA = 0.210;
    float diffuseB = 0.105;

    gl_FragColor = computeNewValue(feedA, killB, uDiffuseScaling * diffuseA, uDiffuseScaling * diffuseB);
}