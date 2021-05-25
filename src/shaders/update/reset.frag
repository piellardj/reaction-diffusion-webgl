precision mediump float;

uniform vec4 uPattern;

varying vec2 vSamplingPosition; // in [0,1]^2

#include "_encode-decode.frag"


void main() {
    float distanceFromCenter = dot(vSamplingPosition - 0.5, vSamplingPosition - 0.5);
    const float blank = 0.0;
    float disc = step(distanceFromCenter, 0.001);
    float circle = step(0.007, distanceFromCenter) * step(distanceFromCenter, 0.01) + step(0.17, distanceFromCenter) * step(distanceFromCenter, 0.18);

    const float A = 1.0;
    float B = dot(uPattern, vec4(blank, disc, circle, 0));
    vec2 values = vec2(A, B);

    gl_FragColor = encode(values);
}