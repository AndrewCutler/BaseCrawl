"use strict";
exports.__esModule = true;
exports.SearchResultResponse = exports.SearchResultDataResponse = void 0;
var SearchResultDataResponse = /** @class */ (function () {
    function SearchResultDataResponse(base) {
        this.IsActive = base.a === 1;
        this.Endpoint = base.i;
        this.Name = base.n;
        this.Years = base.y;
    }
    return SearchResultDataResponse;
}());
exports.SearchResultDataResponse = SearchResultDataResponse;
var SearchResultResponse = /** @class */ (function () {
    function SearchResultResponse(data) {
        this.Data = data.map(function (datum) { return new SearchResultDataResponse(datum); });
        this.Count = data.length;
    }
    return SearchResultResponse;
}());
exports.SearchResultResponse = SearchResultResponse;
