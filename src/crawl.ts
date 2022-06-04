import * as Nightmare from 'nightmare';
import { ISearchResultData, ISearchResult, SearchResultResponse } from './models';

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

// TODO: install concurrently or osome other way to restart on save

/**
 * Performs a lookup of players by name.
 * @returns @see SearchResultResponse.
 */
server.get('/search/:name', async ({ params: { name } }, res) => {
    await nightmare.goto(baseUrl);
    await nightmare.wait();
    await nightmare.type('.search .ac-input', name);
    await nightmare.wait('.ac-dataset-br__players .ac-suggestions');
    const result: ISearchResultData[] = await nightmare.evaluate(() => {
        const suggestions = Array.from(document.querySelectorAll('.ac-suggestion')) as ISearchResult[];

        return suggestions.map(({ __data: data }: ISearchResult) => data);
    }) as ISearchResultData[];


    res.send(new SearchResultResponse(result));
});

/**
 * Grabs all stats for a given player.
 */
server.get('/stats/:endpoint', async ({ params: { endpoint } }, res) => {
    const playerUrl = `${baseUrl}/players/${endpoint[0]}/${endpoint}.shtml`;

    await nightmare.goto(playerUrl);
    await nightmare.wait();
    const result = await nightmare.evaluate(() => {
        const getRowYear = (row: Element) => row.id.slice(17);
        const getActiveFullYears = Array.from(document.querySelectorAll('[id^="batting_standard."]'));
        const getStatByYear = (stat: string, row: HTMLCollection): string => {
            return (Array.from(row) as HTMLElement[]).find(child => child.getAttribute('data-stat') === stat).innerText;
        }

        return getActiveFullYears.map(yearRow => {
            const count = getStatByYear('HR', yearRow.children);
            const year = getRowYear(yearRow);

            return { count, year };
        });
    });

    res.send(result);
});

server.listen(3000, () => console.log('Started sever on port 3000.'));
