precision mediump float;

uniform sampler2D uTexture;

varying vec2 vSamplingPosition; // in [0,1]^2

#include "_encode-decode.frag"

void main() {
    vec4 sample = texture2D(uTexture, vSamplingPosition);
    vec2 values = decode(sample);

    gl_FragColor = vec4(step(0.2, vec3(values.y)), 1);
}