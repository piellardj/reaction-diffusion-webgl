precision mediump float;

uniform sampler2D uTexture;
uniform sampler2D uRamp;

#include "display/_compute-displayed-value.frag"

void main() {
    float value = sampleTexture(uTexture);

    vec3 color = texture2D(uRamp, vec2(value, 0)).rgb;
    gl_FragColor = vec4(color, 1);
}
