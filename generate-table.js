import chroma from "chroma-js";
import { baseColors, lightnessSteps, roundTo100th } from './index';

const table = document.querySelector('.palette');

export function generateTableHead() {
    let columns = baseColors.map(bColor => `
        <th>
            ${bColor.name}<br>
            <input type="text" size="7" value="${bColor.color}" data-name="${bColor.name}" class="js-change-base-color"><br>
            L: ${roundTo100th(chroma(bColor.color).get('lch.l'))}<br>
            C: ${roundTo100th(chroma(bColor.color).get('lch.c'))}<br>
            H: ${roundTo100th(chroma(bColor.color).get('lch.h'))}<br>

            <label>
                <input type="checkbox" ${bColor.isLab ? 'checked' : ''} data-name="${bColor.name}" class="js-change-base-color-model"> LAB
            </label>
        </th>
    `);

    table.querySelector('thead').innerHTML = `
        <tr>
            <th></th>
            ${columns.join('')}
        </tr>
    `;
}
export function generateTableBody() {
    let rows = Object.keys(lightnessSteps).map(step => {
        let columns = baseColors.map(color => `<td data-l="${step}" data-color="${color.name}"></td>`);

        return `
            <tr>
                <th>
                    ${step}<br>
                    L: <input type="text" size="5" value="${lightnessSteps[step]}" placeholder="${lightnessSteps[step]}" data-step="${step}" class="js-change-lightness">
                </th>
                ${columns.join('')}
            </tr>
        `;
    });

    table.querySelector('tbody').innerHTML = rows.join('');
}
export function generateTableFoot() {
    let columns = baseColors.map(bColor => `
        <th>
            H: <input type="text" size="3" value="${bColor.hueCorrection}" data-name="${bColor.name}" class="js-change-scale-hue">
        </th>
    `);

    table.querySelector('tfoot').innerHTML = `
        <tr>
            <th></th>
            ${columns.join('')}
        </tr>
    `;
}
