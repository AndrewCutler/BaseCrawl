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
    // .goto('about:blank')
    .goto('https://www.baseball-reference.com/players/a/alonspe01.shtml')
    .inject('js', './helper.js')
    .wait('#batting_standard_sh')
    // .wait()
    .evaluate(function () {
    // return document.getElementById('batting_standard.2022');
    var rows = getStandardSeasonRows(['2021', '2022']);
    return rows.map(function (row) { return Array.from(row.children).find(function (_a) {
        var stat = _a.dataset.stat;
        return stat === 'HR';
    }).outerText; });
})
    .end()
    .then(console.log)["catch"](console.error);
