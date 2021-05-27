precision mediump float;

uniform sampler2D uTextureRed;
uniform sampler2D uTextureGreen;
uniform sampler2D uTextureBlue;uniform float uScaling;

varying vec2 vSamplingPosition; // in [0,1]^2// Decodes a float value (16 bits in [0,1])
// from a 2D value (2x8bits in [0,1]x[0,1])
float decode16bit(vec2 v) {
    return dot(v, vec2(255.0 / 256.0, 1.0 / 256.0));
}

// Encodes a float value (16 bits in [0,1])
// into a 2D value (2x8bits in [0,1]x[0,1])
vec2 encode16bit(float f) {
    f = 255.99 * clamp(f, 0.0, 1.0);
    return vec2(floor(f) / 255.0, fract(f));
}

vec2 decode(vec4 encoded) {
    return vec2(decode16bit(encoded.rg), decode16bit(encoded.ba));
}

vec4 encode(vec2 decoded) {
    return vec4(encode16bit(decoded.x), encode16bit(decoded.y));
}
float sampleTexture(const sampler2D texture) {
    vec2 samplePosition = 0.5 + (vSamplingPosition - 0.5) * uScaling;

    vec4 sample = texture2D(texture, samplePosition);
    vec2 values = decode(sample);
    return values.y;
}

void main() {
    float valueRed = sampleTexture(uTextureRed);
    float valueGreen = sampleTexture(uTextureGreen);
    float valueBlue = sampleTexture(uTextureBlue);

    vec3 color = step(0.2, vec3(valueRed, valueGreen, valueBlue));
    gl_FragColor = vec4(color, 1);
}