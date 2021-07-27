import chroma from "chroma-js";
import { generateTableHead, generateTableBody, generateTableFoot } from './generate-table'

export const roundTo100th = num => roundTo(num, 100);
const roundTo = (num, multiplier) => Math.round(num * multiplier) / multiplier;

let bgColor = '#FFFFFF';
let correctLightness = true;

const Lbase = 49.5;
const Lincrease = 1.17;
const Ldecrease = 0.77;

export const lightnessSteps = {
    50: 98,
    100: roundTo100th(Lbase * Math.pow(Lincrease, 4)),
    200: roundTo100th(Lbase * Math.pow(Lincrease, 3)),
    300: roundTo100th(Lbase * Math.pow(Lincrease, 2)),
    400: roundTo100th(Lbase * Lincrease),
    500: Lbase,
    600: roundTo100th(Lbase * Ldecrease),
    700: roundTo100th(Lbase * Math.pow(Ldecrease, 2)),
    800: roundTo100th(Lbase * Math.pow(Ldecrease, 3)),
    900: roundTo100th(Lbase * Math.pow(Ldecrease, 4))
};
/*
const lightnessSteps = {
    50: 98,
    100: 93,
    200: 85,
    300: 75,
    400: 65,
    500: 55,
    600: 45,
    700: 35,
    800: 25,
    900: 13
};
*/

export const baseColors = [
    {
        name: 'red',
        color: '#C01C21',
        isLab: true,
        hueCorrection: 0
    },
    {
        name: 'orange',
        color: '#F29C24',
        isLab: true,
        hueCorrection: 0
    },
    {
        name: 'yellow',
        color: '#FFDE00',
        isLab: true,
        hueCorrection: 0
    },
    {
        name: 'lime',
        color: '#89BF1D',
        isLab: false,
        hueCorrection: 0
    },
    {
        name: 'mint',
        color: '#4FC47F',
        isLab: false,
        hueCorrection: 0
    },
    {
        name: 'blue',
        color: '#007DCC',
        isLab: false,
        hueCorrection: 0
    },
    {
        name: 'slate',
        color: '#79808D',
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
    generateScales();
    baseColors.forEach(function (bColor) {
        document.querySelectorAll(`[data-color="${bColor.name}"]`).forEach(function (swatch) {
            let lightnessStep = parseInt(swatch.dataset.l, 10);

            let color = getColorFromScale(bColor, lightnessStep);
            let colorHex = color.hex();
            let lightness = roundTo100th(color.lch()[0]);
            let chrome = roundTo100th(color.lch()[1]);
            let hue = roundTo100th(color.lch()[2]);
            let contrast = roundTo100th(chroma.contrast(colorHex, bgColor));
            let contrastBadge = contrast >= 4.5 ? `✓ ${contrast}` : `<s>${contrast}</s>`;
        
            swatch.style.backgroundColor = colorHex;
            swatch.innerHTML = `
                ${colorHex.toUpperCase()}<br>
                L: ${lightness}<br>
                C: ${chrome}<br>
                H: ${hue}<br>
                ${contrastBadge}

            `;
        });  
    });
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
