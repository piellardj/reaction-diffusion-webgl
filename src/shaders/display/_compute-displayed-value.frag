uniform float uScaling;

varying vec2 vSamplingPosition; // in [0,1]^2

#include "_encode-decode.frag"

float sampleTexture(const sampler2D texture) {
    vec2 samplePosition = 0.5 + (vSamplingPosition - 0.5) * uScaling;

    vec4 sample = texture2D(texture, samplePosition);
    vec2 values = decode(sample);
    return values.y;
}
