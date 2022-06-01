"use strict";
exports.__esModule = true;
var _Nightmare = require('nightmare');
var nightmare = _Nightmare({ show: true });
// getStat is not defined?
var getStat = function (stat) { return document.querySelectorAll("#standard .table-scroll .row-mlb-season [data-stat=\"".concat(stat, "\"]")); };
nightmare
    .goto('https://www.baseball-reference.com/players/a/alonspe01.shtml')
    .wait('#batting_standard_sh')
    .evaluate(function () {
    var row = document.getElementById('batting_standard.2022');
    return Array.from(row.children).find(function (_a) {
        var attributes = _a.attributes;
        return attributes['data-stat'].value === 'HR';
    }).innerText;
})
    .end()
    .then(function (response) {
    console.log('Homers:', response);
})["catch"](function (error) {
    console.error(error);
});
