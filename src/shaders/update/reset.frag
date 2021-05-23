precision mediump float;

varying vec2 vSamplingPosition; // in [0,1]^2

#include "_encode-decode.frag"

void main() {
    vec2 values = vec2(0.9, 0);

    float distanceFromCenter = dot(vSamplingPosition - 0.5, vSamplingPosition - 0.5);
    if (distanceFromCenter > 0.01 && distanceFromCenter < 0.013) {
        values.y = 1.0;
    }

    gl_FragColor = encode(values);
}