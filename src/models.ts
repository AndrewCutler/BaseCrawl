
export interface ISearchResultData {
    /**
     * Player's active status.
     */
    a: number; // 0 or 1; active status

    /**
     * Prefix for player's shtml page
     */
    i: string;

    /**
     * Player name.
     */
    n: string;

    /**
     * Player's active years, hyphen-separated.
     */
    y: string;
}

export interface ISearchResult extends Element {
    __data: ISearchResultData;
}

export class SearchResultDataResponse {
    IsActive: boolean;
    Endpoint: string;
    Name: string;
    Years: string;
    constructor(base: ISearchResultData) {
        this.IsActive = base.a === 1;
        this.Endpoint = base.i;
        this.Name = base.n;
        this.Years = base.y;
    }
}

export class SearchResultResponse {
    Data: SearchResultDataResponse[];
    Count: number;
    constructor(data: ISearchResultData[]) {
        this.Data = data.map(datum => new SearchResultDataResponse(datum));
        this.Count = data.length;
    }
}
