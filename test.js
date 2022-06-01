"use strict";
exports.__esModule = true;
var isDebug = process.argv[2] === 'debug';
var _Nightmare = require('nightmare');
var debugOptions = {
    show: true,
    openDevTools: {
        mode: 'detach'
    }
};
var nightmare = new _Nightmare(isDebug ? debugOptions : { show: false });
var getStandardSeasonRows = function (years) { return years.map(function (year) { return document.getElementById("batting_standard.".concat(year)); }); };
var testGetHomer = function (rows) {
    return Array.from(rows[0].children).find(function (_a) {
        var attributes = _a.attributes;
        return attributes['data-stat'].value === 'HR';
    }).innerText;
};
var logTest;
nightmare
    // .inject('js', './helper.js')
    .goto('https://www.baseball-reference.com/players/a/alonspe01.shtml')
    .wait('#batting_standard_sh')
    .evaluate(function () {
    // logTest();
    // const rows = getStandardSeasonRows(['2021', '2022']);
    var rows = ['2021', '2022'].map(function (year) { return document.getElementById("batting_standard.".concat(year)); });
    return rows[0].children;
    // const row = document.getElementById('batting_standard.2022');
    // return (Array.from(row.children).find(({ attributes }) => attributes['data-stat'].value === 'HR') as HTMLElement).innerText;
})
    .end()
    .then(console.log)["catch"](function (error) {
    console.error(error);
});
