precision mediump float;

uniform vec4 uPattern;

varying vec2 vSamplingPosition; // in [0,1]^2/* Decodes a float value (16 bits in [0,1])
 * from a 2D value (2x8bits in [0,1]x[0,1]) */
float decode16bit(vec2 v) {
    return dot(v, vec2(255.0 / 256.0, 1.0 / 256.0));
}

/* Encodes a float value (16 bits in [0,1])
 * into a 2D value (2x8bits in [0,1]x[0,1]) */
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
void main() {
    float distanceFromCenter = dot(vSamplingPosition - 0.5, vSamplingPosition - 0.5);
    const float blank = 0.0;
    float disc = step(distanceFromCenter, 0.001);
    float circle = step(0.007, distanceFromCenter) * step(distanceFromCenter, 0.01) + step(0.17, distanceFromCenter) * step(distanceFromCenter, 0.18);

    const float A = 1.0;
    float B = dot(uPattern, vec4(blank, disc, circle, 0));
    vec2 values = vec2(A, B);

    gl_FragColor = encode(values);
}