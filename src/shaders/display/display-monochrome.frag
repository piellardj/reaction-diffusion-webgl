precision mediump float;

uniform sampler2D uTexture;

#include "display/_compute-displayed-value.frag"

void main() {
    float value = sampleTexture(uTexture);
    gl_FragColor = vec4(vec3(value), 1);
}