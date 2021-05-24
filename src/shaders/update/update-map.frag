#include "update/_reaction-diffusion.frag"

// x: diffuseA rate
// y: diffuseB rate
uniform vec2 uRates;

void main() {
    float feedA = mix(#INJECT(A_FEEDING_MIN), #INJECT(A_FEEDING_MAX), vSamplingPosition.y);
    float killB = mix(#INJECT(B_KILLING_MIN), #INJECT(B_KILLING_MAX), vSamplingPosition.x);

    gl_FragColor = computeNewValue(feedA, killB, uRates.x, uRates.y);
}