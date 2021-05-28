precision mediump float;

uniform sampler2D uPreviousIteration;
uniform vec2 uTexelSize;

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
vec2 laplacian() {
    return
        decode(texture2D(uPreviousIteration, vSamplingPosition + vec2(-1, -1) * uTexelSize)) * 0.05 +
        decode(texture2D(uPreviousIteration, vSamplingPosition + vec2(+0, -1) * uTexelSize)) * 0.20 +
        decode(texture2D(uPreviousIteration, vSamplingPosition + vec2(+1, -1) * uTexelSize)) * 0.05 +

        decode(texture2D(uPreviousIteration, vSamplingPosition + vec2(-1, +0) * uTexelSize)) * 0.20 +
        decode(texture2D(uPreviousIteration, vSamplingPosition + vec2(+1, +0) * uTexelSize)) * 0.20 +
    
        decode(texture2D(uPreviousIteration, vSamplingPosition + vec2(-1, +1) * uTexelSize)) * 0.05 +
        decode(texture2D(uPreviousIteration, vSamplingPosition + vec2(+0, +1) * uTexelSize)) * 0.20 +
        decode(texture2D(uPreviousIteration, vSamplingPosition + vec2(+1, +1) * uTexelSize)) * 0.05;
}

vec4 computeNewValue(const float feedA, const float killB, const float diffuseA, const float diffuseB) {
    vec2 values = decode(texture2D(uPreviousIteration, vSamplingPosition));
    vec2 laplace = laplacian() - values;


    float A = values.x;
    float B = values.y;
    float reaction = A * B * B;
    const float dt = 1.0;
    values = vec2(
        values.x + dt * (diffuseA * laplace.x - reaction + feedA * (1.0 - A)),
        values.y + dt * (diffuseB * laplace.y + reaction - (killB + feedA) * B)
    );

    return encode(values);
}
uniform sampler2D uImageMapTexture;
uniform vec4 uSampledChannel;
uniform vec2 uImageMapScaling;
uniform float uDiffuseScaling;

void main() {
    vec2 scaledSamplingPosition = 0.5 + (vSamplingPosition - 0.5) * uImageMapScaling;
    float inImageMap = step(0.0, scaledSamplingPosition.x) * step(scaledSamplingPosition.x, 1.0) *
        step(0.0, scaledSamplingPosition.y) * step(scaledSamplingPosition.y, 1.0);

    float mapValue = dot(uSampledChannel, texture2D(uImageMapTexture, scaledSamplingPosition)) * inImageMap;
    mapValue = sqrt(clamp(mapValue - 0.1, 0.0, 1.0));

    float feedA = mix(0.02220, 0.04470, mapValue);
    float killB = mix(0.06516, 0.05789, mapValue);
    float diffuseA = 0.210;
    float diffuseB = 0.105;

    gl_FragColor = computeNewValue(feedA, killB, uDiffuseScaling * diffuseA, uDiffuseScaling * diffuseB);
}