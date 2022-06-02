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

let getStandardSeasonRows;
const baseUrl = 'https://www.baseball-reference.com';

nightmare
    .goto(baseUrl)
    .inject('js', './helper.js')
    .wait()
    .type('.search .ac-input', 'pete')
    .wait('.ac-dataset-br__players .ac-suggestions')
    .evaluate(() => {
        return Array.from(document.querySelectorAll('.ac-suggestion')).map(e => ({ name: (e as any).__value, id: (e as any).__data.i }));
    })
    .end()
    .then(console.log)
    .catch(console.error)
