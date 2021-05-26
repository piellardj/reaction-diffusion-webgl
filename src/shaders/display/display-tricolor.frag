precision mediump float;

uniform sampler2D uTextureRed;
uniform sampler2D uTextureGreen;
uniform sampler2D uTextureBlue;

#include "display/_compute-displayed-value.frag"

void main() {
    float valueRed = sampleTexture(uTextureRed);
    float valueGreen = sampleTexture(uTextureGreen);
    float valueBlue = sampleTexture(uTextureBlue);

    vec3 color = step(0.2, vec3(valueRed, valueGreen, valueBlue));
    gl_FragColor = vec4(color, 1);
}