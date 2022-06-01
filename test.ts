import Nightmare = require('nightmare');

const _Nightmare = require('nightmare');
const nightmare: Nightmare = _Nightmare({ show: true });

// getStat is not defined?
const getStat = (stat) => document.querySelectorAll(`#standard .table-scroll .row-mlb-season [data-stat="${stat}"]`)

nightmare
    .goto('https://www.baseball-reference.com/players/a/alonspe01.shtml')
    .wait('#batting_standard_sh')
    .evaluate(() => {
        const row = document.getElementById('batting_standard.2022');
        return (Array.from(row.children).find(({ attributes }) => attributes['data-stat'].value === 'HR') as HTMLElement).innerText;
    })
    .end()
    .then((response) => {
        console.log('Homers:', response);
    })
    .catch((error) => {
        console.error(error);
    });
