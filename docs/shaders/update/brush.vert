attribute vec2 aCorner; // in {-1,+1}^2

uniform vec2 uPosition; // [-1,+1]^2
uniform vec2 uSize;

varying vec2 vRelativePosition; // in [-1,1]^2

void main(void) {
    gl_Position = vec4(uPosition + aCorner * uSize, 0, 1);
    vRelativePosition = aCorner;
}
