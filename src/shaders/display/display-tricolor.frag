precision mediump float;

uniform sampler2D uTextureRed;
uniform sampler2D uTextureGreen;
uniform sampler2D uTextureBlue;

varying vec2 vSamplingPosition; // in [0,1]^2

#include "_encode-decode.frag"

void main() {
    vec2 valuesRed = decode(texture2D(uTextureRed, vSamplingPosition));
    vec2 valuesGreen = decode(texture2D(uTextureGreen, vSamplingPosition));
    vec2 valueBlue = decode(texture2D(uTextureBlue, vSamplingPosition));

    gl_FragColor = vec4(step(0.2, vec3(valuesRed.y, valuesGreen.y, valueBlue.y)), 1);
}