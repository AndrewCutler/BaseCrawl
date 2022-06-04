import * as Nightmare from 'nightmare';

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

// TODO: figure out model import/compilation

/**
 * Performs a lookup of players by name.
 * @returns @see SearchResultResponse.
 */
server.get('/search/:name', async ({ params: { name } }, res) => {
    await nightmare.goto(baseUrl);
    await nightmare.wait();
    await nightmare.type('.search .ac-input', name);
    await nightmare.wait('.ac-dataset-br__players .ac-suggestions');
    const result = await nightmare.evaluate(() => {
        const suggestions = Array.from(document.querySelectorAll('.ac-suggestion')) as any;

        return suggestions.map(({ __data: data }) => data);
    }) as any[];


    res.send({
        Data: result.map(base => ({
            IsActive: base.a === 1,
            Endpoint: base.i,
            Name: base.n,
            Years: base.y,
        })),
        Count: result.length,
    });
});

/**
 * Grabs all stats for a given player.
 */
server.get('/stats/:endpoint', async ({ params: { endpoint } }, res) => {
    const playerUrl = `${baseUrl}/players/${endpoint[0]}/${endpoint}.shtml`;

    await nightmare.goto(playerUrl);
    await nightmare.wait();
    const result = await nightmare.evaluate(() => {
        // TODO: move out of evaluate scope.
        const Stats = {
            'HomeRun': 'HR',
            'Hits': 'H',
            'Games': 'G',
            'PlateAppearances': 'PA',
            'AtBats': 'AB',
            'Runs': 'R',
            'Doubles': '2B',
            'Triples': '3B',
            'RunsBattedIn': 'RBI',
            'StolenBases': 'SB',
            'CaughtStealing': 'CS',
            'Walks': 'BB',
            'Strikeouts': 'SO',
            'TotalBases': 'TB',
            'SacFlys': 'SF',
        };
        const getRowYear = (row: Element) => row.id.slice(17);
        const getActiveFullYears = Array.from(document.querySelectorAll('[id^="batting_standard."]'));
        const getStatByYear = (stat: string, row: HTMLCollection): string => {
            return (Array.from(row) as HTMLElement[]).find(child => child.getAttribute('data-stat') === stat).innerText;
        }

        return getActiveFullYears.map(yearRow => {
            const stats = [];
            for (const key of Object.keys(Stats)) {
                const value = parseInt(getStatByYear(Stats[key], yearRow.children), 10);
                stats.push({ Name: key, Value: value });
            }
            const year = getRowYear(yearRow);

            return { Stats: stats, Year: year };
        });
    });

    res.send(result);
});

server.listen(3000, () => console.log('Started sever on port 3000.'));
