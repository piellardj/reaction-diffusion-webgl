precision mediump float;

varying vec2 vRelativePosition; // in [-1,1]^2

#include "_encode-decode.frag"

void main() {
    float distanceSquared = dot(vRelativePosition, vRelativePosition);

    if (distanceSquared > 1.0) {
        discard;
    }

    vec2 values = vec2(1);
    gl_FragColor = encode(values);
}