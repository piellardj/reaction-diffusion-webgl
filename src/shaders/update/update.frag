precision mediump float;

uniform sampler2D uTexture;
uniform vec2 uTexelSize;

// x: feedA rate
// y: killB rate
// z: diffuseA rate
// w: diffuseB rate
uniform vec4 uRates;

varying vec2 vSamplingPosition; // in [0,1]^2

#include "_encode-decode.frag"

vec2 laplacian() {
    return
        decode(texture2D(uTexture, vSamplingPosition + vec2(-1, -1) * uTexelSize)) * 0.05 +
        decode(texture2D(uTexture, vSamplingPosition + vec2(+0, -1) * uTexelSize)) * 0.20 +
        decode(texture2D(uTexture, vSamplingPosition + vec2(+1, -1) * uTexelSize)) * 0.05 +

        decode(texture2D(uTexture, vSamplingPosition + vec2(-1, +0) * uTexelSize)) * 0.20 +
        decode(texture2D(uTexture, vSamplingPosition + vec2(+0, +0) * uTexelSize)) * -1.0 +
        decode(texture2D(uTexture, vSamplingPosition + vec2(+1, +0) * uTexelSize)) * 0.20 +
    
        decode(texture2D(uTexture, vSamplingPosition + vec2(-1, +1) * uTexelSize)) * 0.05 +
        decode(texture2D(uTexture, vSamplingPosition + vec2(+0, +1) * uTexelSize)) * 0.20 +
        decode(texture2D(uTexture, vSamplingPosition + vec2(+1, +1) * uTexelSize)) * 0.05;
}

void main() {
    vec4 sample = texture2D(uTexture, vSamplingPosition);

    vec2 values = decode(sample);

    float A = values.x;
    float B = values.y;

    vec2 laplace = laplacian();
    float reaction = A * B * B;
    const float dt = 1.0;
    values = vec2(
        values.x + dt * (uRates.z * laplace.x - reaction + uRates.x * (1.0 - A)),
        values.y + dt * (uRates.w * laplace.y + reaction - (uRates.y + uRates.x) * B)
    );

    vec4 encoded = encode(values);

    gl_FragColor = encoded;
}