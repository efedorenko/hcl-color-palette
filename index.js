import chroma from "chroma-js";
import { generateTableHead, generateTableBody, generateTableFoot } from './generate-table'
import { matchPaletteToExistingColors } from "./match-colors";
import { APCAcontrast } from './APCAonly.98e_d12e';

export const roundTo100th = num => roundTo(num, 100);
export const roundTo10th = num => roundTo(num, 10);
export const roundToWhole = num => roundTo(num, 1);
const roundTo = (num, multiplier) => Math.round(num * multiplier) / multiplier;

let bgColor = '#FFFFFF';
let correctLightness = true;

export const lightnessSteps = {
    50: 98,
    100: 93.3,
    200: 88.6, // to match yellow
    300: 79.9,
    400: 71.2, // to match mint
    500: 60.5,
    600: 49.8, // to match blue
    700: 38.4,
    800: 27.0,
    900: 15.6
};

export const baseColors = [
    {
        name: 'red',
        color: '#e94c49',
        isLab: true,
        hueCorrection: 0
    },
    {
        name: 'orange',
        color: '#F1903C',
        isLab: true,
        hueCorrection: -10
    },
    {
        name: 'yellow',
        color: '#f3e203',
        isLab: true,
        hueCorrection: -15
    },
    {
        name: 'lime',
        color: '#89BF1D',
        isLab: false,
        hueCorrection: 0
    },
    {
        name: 'mint',
        color: '#64c273',
        isLab: false,
        hueCorrection: 15
    },
    {
        name: 'blue',
        color: '#007DCC',
        isLab: false,
        hueCorrection: 0
    },
    {
        name: 'slate',
        color: '#768092',
        isLab: false,
        hueCorrection: 0
    },
    {
        name: 'beige',
        color: '#EAE8DE',
        isLab: false,
        hueCorrection: 0
    },
    {
        name: 'grey',
        color: '#808080',
        isLab: false,
        hueCorrection: 0
    }
];

export let palette;


// Set up the scene

generateTableHead();
generateTableBody();
generateTableFoot();


// Set up colors

generatePalette();
generateLightnessChart();

document.addEventListener('change', event => {
    let target = event.target;

    if (target.classList.contains('js-change-base-color')) {
        changeBaseColor(target);
    }
    if (target.classList.contains('js-set-base-color-from-l')) {
        setBaseColorFromL(target);
    }
    if (target.classList.contains('js-set-base-color-from-c')) {
        setBaseColorFromC(target);
    }
    if (target.classList.contains('js-set-base-color-from-h')) {
        setBaseColorFromH(target);
    }
    if (target.classList.contains('js-change-base-color-model')) {
        changeBaseColorModel(target);
    }

    if (target.classList.contains('js-change-scale-hue')) {
        changeScaleHue(target);
    }
    if (target.classList.contains('js-change-lightness')) {
        changeLightness(target);
    }
    if (target.classList.contains('js-change-bg-color')) {
        changeBgAndContrast(target)
    }
    if (target.classList.contains('js-correct-lightness')) {
        correctLightness = target.checked;
        generatePalette();
    }
})


// Color manipulations

function getColorFromScale(bColor, lightnessStep) {
    const lightnessStepsTotal = Object.keys(lightnessSteps).length;
    const lightnessIndex = Object.keys(lightnessSteps).indexOf(lightnessStep.toString());
    const lightnessValue = lightnessSteps[lightnessStep] / 100;

    const hueAdjustment = (bColor.hueCorrection / lightnessStepsTotal) * (lightnessIndex + 1);
    console.log(`${lightnessStep}: ${lightnessIndex} (${hueAdjustment})`)
    const color = bColor.scale(lightnessValue)
    return chroma(color).set('lch.h', color.lch()[2] + hueAdjustment);
}

function generatePalette() {
    // Reset palette before redefining
    palette = [
        {
            color: '#FFF',
            name: 'white',
            lightnessStep: '0'
        },
        {
            color: '#000',
            name: 'black',
            lightnessStep: '1000'
        }
    ];

    generateScales();
    baseColors.forEach(function (bColor) {
        document.querySelectorAll(`[data-color="${bColor.name}"]`).forEach(function (swatch) {
            let lightnessStep = parseInt(swatch.dataset.l, 10);

            let color = getColorFromScale(bColor, lightnessStep);
            let colorHex = color.hex();
            let lightness = roundTo100th(color.lch()[0]);
            let chrome = roundTo100th(color.lch()[1]);
            let hue = roundTo100th(color.lch()[2]);
            let contrast = roundTo10th(chroma.contrast(colorHex, bgColor));
            let contrastBadge = contrast >= 4.5 ? `✓ ${contrast}` : `<s>${contrast}</s>`;
            let wcag3contrast = roundToWhole(APCAcontrast(bgColor.replace('#', '0x'), colorHex.replace('#', '0x')));
        
            swatch.style.backgroundColor = colorHex;
            swatch.innerHTML = `
                ${colorHex.toUpperCase()}<br>
                L: ${lightness}<br>
                C: ${chrome}<br>
                H: ${hue}<br>
                <span title="WCAG 2.1 contrast ratio">${contrastBadge}</span> / <span title="WCAG 3 contrast ratio">${wcag3contrast}</span>
                

            `;

            palette.push({
                color: colorHex,
                name: bColor.name,
                lightnessStep: lightnessStep
            })
        });
    });
    matchPaletteToExistingColors();
}

function generateScales () {
    // Add scales to base colors
    baseColors.forEach(bColor => {
        bColor.scale = chroma.scale(['black', bColor.color, 'white']).mode(bColor.isLab ? 'lab' : 'rgb').correctLightness(correctLightness);
    })
}

function _changeBaseColorObject(name, fn) {
    baseColors.forEach(function(bColor, i) {
        if (name === bColor.name) {
            console.log(`Change base color ${baseColors[i].name}`);
            fn(i);

            generateTableHead();
            generatePalette();
        }
    })
}

function changeBaseColor(input) {
    _changeBaseColorObject(input.dataset.name, (i) => {
        console.log(`${baseColors[i].color} => ${input.value}`);
        baseColors[i].color = input.value;

    });
}

function changeBaseColorModel(checkbox) {
    _changeBaseColorObject(checkbox.dataset.name, (i) => {
        console.log(`LAB: ${checkbox.checked}`);
        baseColors[i].isLab = checkbox.checked;
    });
}

function setBaseColorFromL(input) {
    const lightness = input.value;
    if (lightness < 0 || lightness > 150) {
        alert('Lightness is out of range');
        return;
    }
    _changeBaseColorObject(input.dataset.name, (i) => {
        baseColors[i].color = chroma(baseColors[i].color).set('lch.l', lightness);
    });
}
function setBaseColorFromC(input) {
    const chrome = input.value;
    if (chrome < 0 || chrome > 150) {
        alert('Chromacity is out of range');
        return;
    }
    _changeBaseColorObject(input.dataset.name, (i) => {
        baseColors[i].color = chroma(baseColors[i].color).set('lch.c', chrome);
    });
}
function setBaseColorFromH(input) {
    const hue = input.value;
    if (hue < 0 || hue > 360) {
        alert('Hue is out of range');
        return;
    }
    _changeBaseColorObject(input.dataset.name, (i) => {
        baseColors[i].color = chroma(baseColors[i].color).set('lch.h', hue);
    });
}

function changeScaleHue(input) {
    _changeBaseColorObject(input.dataset.name, (i) => {
        const value = parseInt(input.value, 10);
        if (value >= 360 || value <= -360) {
            alert('Hue is out of supported range');
            return;
        }

        baseColors[i].hueCorrection = input.value;
        console.log(`Hue correction of ${input.dataset.name} set to ${value}.`)
    });
}

function changeLightness(input) {
    let step = input.dataset.step;
    let value = input.value;
    lightnessSteps[step] = value;

    generatePalette();
    generateLightnessChart();
}

function changeBgAndContrast(input) {
    let newBg = input.value;
    bgColor = newBg;
    document.body.style.backgroundColor = newBg;

    generatePalette();
}

function generateLightnessChart() {
    const chart = document.querySelector('.lightness-chart');
    const dots = Object.keys(lightnessSteps).map(step => {
        const value = lightnessSteps[step];
        return `<div class="lightness-chart_dot" style="bottom:${value}%; left:${step/10}%; opacity:${110-value}%;" title="${step}: ${value}"></div>`
    });
    chart.innerHTML = dots.join('');
}
