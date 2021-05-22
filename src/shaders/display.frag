precision mediump float;

// uniform sampler2D uTexture;

varying vec2 vSamplingPosition; // in [0,1]^2

void main() {
    // gl_FragColor = texture2D(uTexture, vSamplingPosition);
    gl_FragColor = vec4(vSamplingPosition, 0, 1);
}