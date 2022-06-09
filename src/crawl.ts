import * as Nightmare from 'nightmare';

const express = require('express');
const _Nightmare = require('nightmare');
const cors = require('cors');

const isDebug = process.argv[2] === 'debug';
const debugOptions = {
    show: true,
    openDevTools: {
        mode: 'detach'
    },
}
const corsOptions = {
    origin: 'http://localhost:3000'
};

const PORT = '1986';

const nightmare: Nightmare = new _Nightmare(isDebug ? debugOptions : { show: false });
const server = express(/*cors()*/);

const baseUrl = 'https://www.baseball-reference.com';

// TODO: figure out model import/compilation
// TODO: figure out injecting into evaluate scope?
// TODO: handle search requests that return nothing
// TODO: handle cancellation requests

server.get('/', (req, res) => res.send('Home plate.'));

/**
 * Performs a lookup of players by name.
 * @returns @see SearchResultResponse.
 */
server.get('/search/:name', cors(corsOptions), async (req, res, next) => {
    const { params: { name } } = req;
    try {

        await nightmare.goto(baseUrl);
        await nightmare.wait();
        await nightmare.type('.search .ac-input', name);
        await nightmare.wait('.ac-dataset-br__players .ac-suggestions');
        const result = await nightmare.evaluate(() => {
            const suggestions = Array.from(document.querySelectorAll('.ac-suggestion')) as any;

            return suggestions.map(({ __data: data }) => data);
        }) as any[];

        res.json({
            Data: result.map(base => ({
                IsActive: base.a === 1,
                Endpoint: base.i,
                Name: base.n,
                Years: base.y,
                // last row is always dummy value if { IsActive: false, Name: %searchString% }.
                // This is a hacky way to filter it out rather than fix it through querySelector.
            })).filter(({ Endpoint }) => !!Endpoint),
            Count: result.length - 1,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * Grabs all stats for a given player.
 */
server.get('/stats/:endpoint', cors(corsOptions), async ({ params: { endpoint } }, res, next) => {
    const playerUrl = `${baseUrl}/players/${endpoint[0]}/${endpoint}.shtml`;

    try {
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
            const getWARByYear = (year: string) => {
                const valueRow = document.getElementById(`batting_value.${year}`);
                const war = (Array.from(valueRow.children)[15] as HTMLElement).innerText;

                return { Name: 'WAR', Value: parseFloat(war) };
            }

            return getActiveFullYears.map(yearRow => {
                const stats = [];
                for (const key of Object.keys(Stats)) {
                    const value = parseInt(getStatByYear(Stats[key], yearRow.children), 10);
                    stats.push({ Name: key, Value: value });
                }
                const year = getRowYear(yearRow);

                stats.push(getWARByYear(year));

                return { Stats: stats, Year: year };
            });
        });

        res.json(result);
    } catch (error) {
        next(error)
    }
});

server.listen(PORT, () => console.log(`Started sever on port ${PORT}.`));
