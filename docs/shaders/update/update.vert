attribute vec2 aCorner; // in {-1,+1}^2

varying vec2 vSamplingPosition; // in [0,1]^2

void main(void) {
    gl_Position = vec4(aCorner, 0, 1);
    vSamplingPosition = 0.5 + 0.5 * aCorner;
}
