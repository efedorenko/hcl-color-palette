import chroma from "chroma-js";
import * as pmColorsUsage from './pm-colors-usage.json'
import {palette, roundTo100th} from "./index";

let stats = {};
const indicator = {
    perfect: '✅ 👏👏👏',
    great: '✅',
    good: '👌',
    ok: 'ok',
    fail: '❌'
}

function listExistingColors() {
    const list = document.querySelector('.colors-samples');
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
        if (minDistance === 0) {
            distanceIndicator = indicator.perfect;
            stats.perfect++;
        } else if (minDistance < 1) {
            distanceIndicator = indicator.great;
            stats.great++;
        } else if (minDistance < 3) {
            distanceIndicator = indicator.good;
            stats.good++;
        } else if (minDistance > 20) {
            distanceIndicator = indicator.fail;
            stats.fail++;
        } else {
            distanceIndicator = indicator.ok;
            stats.ok++;
        }

        let li = document.createElement('li');
        li.innerHTML = `
            <span style="background-color: ${color};">${color}</span>
            (${pmColorsUsage[color]})
            &rarr;
            <span style="background-color: ${closestBaseColor.color};">${closestBaseColor.color}</span>
            =
            ${roundTo100th(minDistance)}
            ${distanceIndicator}
        `;
        list.append(li);
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