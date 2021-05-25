precision mediump float;

varying vec2 vRelativePosition; // in [-1,1]^2

void main() {
    float distanceSquared = dot(vRelativePosition, vRelativePosition);

    if (distanceSquared < 0.7 || distanceSquared > 0.98) {
        discard;
    }

    gl_FragColor = vec4(1, 0, 0, 1);
}