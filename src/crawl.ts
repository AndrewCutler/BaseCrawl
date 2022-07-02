import { PlayerStats, IStats, STATS } from './models';

const cheerio = require('cheerio');
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');

const corsOptions = {
    origin: process.env.APP_ORIGIN || 'http://localhost:3000'
};
const PORT = process.env.PORT || '1986';
const baseUrl = 'https://www.baseball-reference.com';
const playerData = JSON.parse(fs.readFileSync('players.json', { encoding: 'utf-8' }));

const server = express(/*cors()*/);

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

const stripStyling = (html: string): string => html.replace(/(<\/?strong>)|(<\/?em>)/g, '');

// This content is commented out on page load. Not sure of a more elegant soluation.
const uncommentValueTable = (data: string): string => {
    return data
        .replace('<!--\n\n<div class="table_container" id="div_batting_value">', '<div class="table_container" id="div_batting_value">')
        .replace('</table>\n\n\n</div>\n-->', '</table>\n\n\n</div>\n');
}

// buildPlayerLookup();

const getPlayerStats = (url: string) => {
    return axios.get(url).then((response) => {
        if (response && response.data) {
            const $ = cheerio.load(uncommentValueTable(response.data));

            const getStandardBattingYears = (): any[] =>
                $('tr[id^="batting_standard."]').each((_, element) => $(element).html());
            const getStatByStandardBattingYear = (stat: string, year: string) => {
                const result = $(`[id="${year}"] [data-stat="${stat}"]`).html()

                return stripStyling(result);
            }
            const getStatByCareer = (stat: string) => {
                const result = $(`#all_batting_standard tfoot tr td[data-stat=${stat}]`).html();

                return stripStyling(result);
            }
            const getWAR = (year) => $(`tr[id="batting_value.${year}"] [data-stat="WAR"]`);

            let playerStats: PlayerStats = new PlayerStats();

            for (const row of getStandardBattingYears()) {
                const id = row.attribs.id;
                const year = id.split('.')[1];
                const playerAge = getStatByStandardBattingYear('age', id);

                let stats: IStats;
                STATS.forEach(stat => {
                    const value = getStatByStandardBattingYear(stat, id);
                    stats = {
                        ...stats,
                        [stat]: parseFloat(value),
                        Year: year,
                        Age: playerAge
                    }
                });

                stats = {
                    ...stats,
                    'WAR': +getWAR(year).text()
                }

                playerStats = {
                    ...playerStats,
                    Ages: { ...playerStats.Ages, [playerAge]: stats },
                    Years: { ...playerStats.Years, [year]: stats },
                };
            }

            let careerStats: IStats;
            STATS.forEach(stat => {
                const value = getStatByCareer(stat);
                careerStats = {
                    ...careerStats,
                    [stat]: parseFloat(value),
                    Year: 'Career',
                    Age: 'Career'
                }
            });

            // TODO: grab career WAR

            playerStats = {
                ...playerStats,
                Ages: { ...playerStats.Ages, Career: careerStats },
                Years: { ...playerStats.Years, Career: careerStats },
            }

            return playerStats;
        } else {
            console.error(`Missing response for ${url}`);
        }
    });
};

/**
 * Routes.
 */

/**
 * Useless landing route.
 */
server.get('/', (req, res) => {
    res.send('Home plate.');
});

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
 * Grabs all stats for a given player organized into year.
 */
server.get('/stats/:endpoint', cors(corsOptions), async ({ params: { endpoint } }, res, next) => {
    const playerUrl = `${baseUrl}/players/${endpoint[0]}/${endpoint}.shtml`;

    try {
        const result = await getPlayerStats(playerUrl);

        res.json(result);
    } catch (error) {
        next(error)
    }
});

server.get('/refresh', (req, res) => {
    // TODO: retrieve player data and update once daily
})

server.listen(PORT, () => console.log(`Started sever on port ${PORT}.`));
