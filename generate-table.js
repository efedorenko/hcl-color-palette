import { baseColors, lightnessSteps } from './index';

const table = document.querySelector('.palette');

function generateTableHead() {
    let columns = baseColors.map(color => `
        <th>
            ${color.name}<br>
            <input type="text" size="7" value="${color.color}" data-name="${color.name}" class="js-change-base-color"><br>
            <label>
                <input type="checkbox" ${color.isLab ? 'checked' : ''} data-name="${color.name}" class="js-change-base-color-model"> LAB
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
function generateTableBody() {
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
function generateTableFoot() {
    let columns = baseColors.map(color => `
        <th>
            H: <input type="text" size="3" value="0" data-name="${color.name}" class="js-change-scale-hue">
        </th>
    `);

    table.querySelector('tfoot').innerHTML = `
        <tr>
            <th></th>
            ${columns.join('')}
        </tr>
    `;
}

export function generateTable() {
    generateTableHead();
    generateTableBody();
    generateTableFoot();
}