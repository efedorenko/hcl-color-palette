import { colorIds, lightnessSteps } from './index';

const table = document.querySelector('.palette');

export function generateTableHead() {
    let columns = colorIds.map(color => `<th>${color}</th>`);

    table.querySelector('thead').innerHTML = `
        <tr>
            <th></th>
            ${columns.join('')}
        </tr>
    `;
}
export function generateTableBody() {
    let rows = Object.keys(lightnessSteps).map(step => {
        let columns = colorIds.map(color => `<td data-l="${step}" data-color="${color}"></td>`);

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

