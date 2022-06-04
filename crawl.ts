import Nightmare = require('nightmare');

const express = require('express');
const _Nightmare = require('nightmare');

const isDebug = process.argv[2] === 'debug';
const debugOptions = {
	show: true,
	openDevTools: {
		mode: 'detach'
	},
}
const nightmare: Nightmare = new _Nightmare(isDebug ? debugOptions : { show: false });
const server = express();


const baseUrl = 'https://www.baseball-reference.com';

interface ISearchResultData {
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

interface ISearchResult extends Element {
	__data: ISearchResultData;
}

class SearchResultDataResponse {
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

class SearchResultResponse {
	Data: SearchResultDataResponse[];
	Count: number;
	constructor(data: ISearchResultData[]) {
		this.Data = data.map(datum => new SearchResultDataResponse(datum));
		this.Count = data.length;
	}
}

// TODO: install concurrently or osome other way to restart on save

server.get('/search/:name', async ({ params: { name } }, res) => {
	await nightmare.goto(baseUrl);
	await nightmare.wait();
	await nightmare.type('.search .ac-input', name);
	await nightmare.wait('.ac-dataset-br__players .ac-suggestions');
	const result: ISearchResultData[] = await nightmare.evaluate(() => {
		const suggestions = Array.from(document.querySelectorAll('.ac-suggestion'));

		return suggestions.map(({ __data: data }: ISearchResult) => data);
	}) as ISearchResultData[];


	res.send(new SearchResultResponse(result));
});

server.get('/stats/:endpoint/:years/:categories', async ({ params }, res) => {
	const { endpoint, years: _years, categories } = params;

	const years: string[] = _years.split(',');

	const playerUrl = `${baseUrl}/players/${endpoint[0]}/${endpoint}.shtml`;

	await nightmare.goto(playerUrl);
	await nightmare.wait();
	nightmare.evaluate((playerUrl) => {
		const getStatByYear = (stat: string, row: HTMLCollection): string => {
			return (Array.from(row) as HTMLElement[]).find(child => child.getAttribute('data-stat') === stat).innerText;
		}

		return years.map(year => {
			const yearRow = document.getElementById(`batting_standard.${year}`);
			const count = getStatByYear('HR', yearRow.children);

			return { count, year };
		});
	}, playerUrl).then(() => undefined);

	res.send(result);
});

server.listen(3000, () => console.log('Started sever on port 3000.'));
