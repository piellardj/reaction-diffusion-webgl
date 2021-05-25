varying vec2 vSamplingPosition; // in [0,1]^2

#include "_encode-decode.frag"

float sampleTexture(const sampler2D texture) {
    vec4 sample = texture2D(texture, vSamplingPosition);
    vec2 values = decode(sample);

    return step(0.2, values.y);
}
