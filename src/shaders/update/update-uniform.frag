#include "update/_reaction-diffusion.frag"

// x: feedA rate
// y: killB rate
// z: diffuseA rate
// w: diffuseB rate
uniform vec4 uRates;


void main() {
    gl_FragColor = computeNewValue(uRates.x, uRates.y, uRates.z, uRates.w);
}