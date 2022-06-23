
import * as Nightmare from 'nightmare';

const express = require('express');
const _Nightmare = require('nightmare');
const cors = require('cors');
const fs = require('fs');

const isDebug = process.argv[2] === 'debug';
const debugOptions = {
    show: true,
    openDevTools: {
        mode: 'detach'
    },
}
const corsOptions = {
    origin: process.env.APP_ORIGIN || 'http://localhost:3000'
};

const PORT = process.env.PORT || '1986';

const nightmare: Nightmare = new _Nightmare(isDebug ? debugOptions : { show: false });
const server = express(/*cors()*/);

const baseUrl = 'https://www.baseball-reference.com';

const playerData = JSON.parse(fs.readFileSync('players.json', { encoding: 'utf-8' }));

// TODO: handle cancellation requests

server.get('/', (req, res) => {
    res.send('Home plate.');
});

const buildPlayerLookup = () => {
    fs.readFile('players.csv', (err, data) => {
        if (err) throw err;
        const playerArray = data.toString().split('\n').map(p => p.split(','));

        const playerLookup = playerArray.reduce((prev, curr) => {
            const [endpoint, name, years] = curr;
            const entry = {
                Endpoint: endpoint,
                Name: name,
                Years: years
            };

            if (prev[name]) {
                prev[name] = [...prev[name], entry]
            } else {
                prev[name] = [entry];
            }

            return prev;
        }, {});

        fs.writeFile('players.json', JSON.stringify(playerLookup), console.error)
    });
}

// buildPlayerLookup();

/**
 * Performs a lookup of players by name.
 * @returns Lookup of name to list of players with that name.
 */
server.get('/search/:name', cors(corsOptions), async (req, res, next) => {
    const { params: { name } } = req;

    try {
        const matches = new Set<string>();
        const _name = name.toLowerCase();
        for (const key in playerData) {
            if (key.toLowerCase().includes(_name) && !matches.has(_name)) {
                matches.add(key);
            }
        }

        const result = Array.from(matches)
            .reduce((prev, key) => ({ ...prev, [key]: playerData[key] }), {});

        res.json(result);
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

server.get('/refresh', (req, res) => {
    // TODO: retrieve player data and update once daily
})

server.listen(PORT, () => console.log(`Started sever on port ${PORT}.`));
