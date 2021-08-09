import chroma from "chroma-js";
import * as pmColorsUsage from './pm-colors-app-eeae6fbd.json'
import {palette, roundTo, roundTo10th} from "./index";

let stats = {};
const indicator = {
    perfect: '🎉',
    great: '✅',
    good: '👌',
    ok: 'ok',
    fail: '❌'
}

function listExistingColors() {
    const list = document.querySelector('.colors-samples tbody');
    list.innerHTML = '';

    // Reset stats
    stats = {
        perfect: 0,
        great: 0,
        good: 0,
        ok: 0,
        fail: 0
    };

    Object.keys(pmColorsUsage).forEach(color => {
        let closestBaseColor;
        let minDistance;

        if (!chroma.valid(color)) {
            console.log(`❌ Invalid color: ${color}`);
            return;
        }

        palette.forEach(pColor => {
            // const distance = chroma.deltaE(color, pColor.color);
            const distance = chroma.distance(color, pColor.color);
            if (minDistance === undefined || distance < minDistance) {
                minDistance = distance;
                closestBaseColor = pColor;
            }
        });

        let distanceIndicator;
        if (minDistance < 0.05) { // not 0 because otherwise valid colors converted to hsla aren't counted
            distanceIndicator = indicator.perfect;
            stats.perfect++;
        } else if (minDistance < 1) {
            distanceIndicator = indicator.great;
            stats.great++;
        } else if (minDistance < 3.5) {
            distanceIndicator = indicator.good;
            stats.good++;
        } else if (minDistance > 20) {
            distanceIndicator = indicator.fail;
            stats.fail++;
        } else {
            distanceIndicator = indicator.ok;
            stats.ok++;
        }

        let tr = document.createElement('tr');
        let paddedDistance = roundTo10th(minDistance) % 1 === 0 ? roundTo10th(minDistance) + '.0' : roundTo10th(minDistance);
        tr.innerHTML = `
            <td align="right">${pmColorsUsage[color]}</td>
            <td><span style="background-color: ${color};">${color}</span></td>
            <td><span style="background-color: ${closestBaseColor.color};">${closestBaseColor.color}</span></td>
            <td align="right">${paddedDistance}</td>
            <td>${distanceIndicator}</td>
            <td align="right">${closestBaseColor.name} ${closestBaseColor.lightnessStep}</td>
        `;
        list.append(tr);
    });
}

function generateStats() {
    const statsEl = document.querySelector('.matching-stats');

    const values = Object.keys(indicator).map(rate => `
        <li>
            ${indicator[rate]}: ${stats[rate]}
        </li>
    `);
    statsEl.innerHTML = `
        <ul>
            ${values.join('')}        
            <li>Total existing colors: ${Object.keys(pmColorsUsage).length}</li>
        </ul>
    `;
}

export function matchPaletteToExistingColors() {
    listExistingColors();
    generateStats();
}