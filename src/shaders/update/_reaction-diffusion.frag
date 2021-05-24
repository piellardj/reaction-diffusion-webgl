precision mediump float;

uniform sampler2D uPreviousIteration;
uniform vec2 uTexelSize;

varying vec2 vSamplingPosition; // in [0,1]^2

#include "_encode-decode.frag"

vec2 laplacian() {
    return
        decode(texture2D(uPreviousIteration, vSamplingPosition + vec2(-1, -1) * uTexelSize)) * 0.05 +
        decode(texture2D(uPreviousIteration, vSamplingPosition + vec2(+0, -1) * uTexelSize)) * 0.20 +
        decode(texture2D(uPreviousIteration, vSamplingPosition + vec2(+1, -1) * uTexelSize)) * 0.05 +

        decode(texture2D(uPreviousIteration, vSamplingPosition + vec2(-1, +0) * uTexelSize)) * 0.20 +
        decode(texture2D(uPreviousIteration, vSamplingPosition + vec2(+0, +0) * uTexelSize)) * -1.0 +
        decode(texture2D(uPreviousIteration, vSamplingPosition + vec2(+1, +0) * uTexelSize)) * 0.20 +
    
        decode(texture2D(uPreviousIteration, vSamplingPosition + vec2(-1, +1) * uTexelSize)) * 0.05 +
        decode(texture2D(uPreviousIteration, vSamplingPosition + vec2(+0, +1) * uTexelSize)) * 0.20 +
        decode(texture2D(uPreviousIteration, vSamplingPosition + vec2(+1, +1) * uTexelSize)) * 0.05;
}

vec4 computeNewValue(const float feedA, const float killB, const float diffuseA, const float diffuseB) {
    vec2 laplace = laplacian();

    vec2 values = decode(texture2D(uPreviousIteration, vSamplingPosition));

    float A = values.x;
    float B = values.y;
    float reaction = A * B * B;
    const float dt = 1.0;
    values = vec2(
        values.x + dt * (diffuseA * laplace.x - reaction + feedA * (1.0 - A)),
        values.y + dt * (diffuseB * laplace.y + reaction - (killB + feedA) * B)
    );

    return encode(values);
}