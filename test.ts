import Nightmare = require('nightmare');

const isDebug = process.argv[2] === 'debug';
const _Nightmare = require('nightmare');
const debugOptions = {
    show: true,
    openDevTools: {
        mode: 'detach'
    },
}
const nightmare: Nightmare = new _Nightmare(isDebug ? debugOptions : { show: false });

const getStandardSeasonRows = (years: string[]): HTMLElement[] => years.map((year) => document.getElementById(`batting_standard.${year}`));
const testGetHomer = (rows: HTMLElement[]): string => {
    return (Array.from(rows[0].children).find(({ attributes }) => attributes['data-stat'].value === 'HR') as HTMLElement).innerText;
};
let logTest;


nightmare
    // .inject('js', './helper.js')
    .goto('https://www.baseball-reference.com/players/a/alonspe01.shtml')
    .wait('#batting_standard_sh')
    .evaluate(() => {
        // logTest();
        // const rows = getStandardSeasonRows(['2021', '2022']);
        const rows = ['2021', '2022'].map((year) => document.getElementById(`batting_standard.${year}`));
        return rows[0].children;
        // const row = document.getElementById('batting_standard.2022');
        // return (Array.from(row.children).find(({ attributes }) => attributes['data-stat'].value === 'HR') as HTMLElement).innerText;
    })
    .end()
    .then(console.log)
    .catch((error) => {
        console.error(error);
    });
