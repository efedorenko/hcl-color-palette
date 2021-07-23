import chroma from "chroma-js";
import {generateTableHead, generateTableBody} from './generate-table'

const roundTo100th = num => roundTo(num, 100);
const roundTo = (num, multiplier) => Math.round(num * multiplier) / multiplier;

let bgColor = '#FFFFFF';

export const colorIds = [
    'red',
    'orange',
    'yellow',
    'lime',
    'mint',
    'blue',
    'slate',
    'grey'
];

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

let correctLightness = true;
const colorScales = () => {
    const createScaleRange = color => ['black', color, 'white'];
    const createScale = (color, model) => chroma.scale(createScaleRange(color)).mode(model ? model : 'rgb').correctLightness(correctLightness);
    
    return {
        'red': createScale('#C01C21', 'lab'),
        'orange': createScale('#F29C24', 'lab'),
        'yellow': createScale('#FFDE00', 'lab'),
        'lime': createScale('#89BF1D'),
        'mint': createScale('#4FC47F'),
        'blue': createScale('#007DCC'),
        'slate': createScale('#79808D'),
        'grey': createScale('#808080')
    }
}


generateTableHead();
generateTableBody();
generatePalette();
generateLightnessChart();

document.addEventListener('change', event => {
    let target = event.target;

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

function generatePalette() {
    colorIds.forEach(function (colorId) {
        document.querySelectorAll(`[data-color="${colorId}"]`).forEach(function (swatch) {
            let lightnessStep = parseInt(swatch.dataset.l, 10);
            let lightnessValue = lightnessSteps[lightnessStep] / 100;
            let color = colorScales()[colorId](lightnessValue);
            let colorHex = color.hex();
            let hue = Math.round(color.lch()[2]);
            let chrome = Math.round(color.lch()[1]);
            let contrast = roundTo100th(chroma.contrast(colorHex, bgColor));
            let contrastBadge = contrast >= 4.5 ? `✓ ${contrast}` : `<s>${contrast}</s>`;
        
            swatch.style.backgroundColor = colorHex;
            swatch.innerHTML = `
                ${colorHex.toUpperCase()}<br>
                L: ${roundTo100th(lightnessValue)}<br>
                C: ${chrome}<br>
                H: ${hue}<br>
                ${contrastBadge}

            `;
        });  
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
