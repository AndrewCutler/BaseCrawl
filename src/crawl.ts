const cheerio = require('cheerio');
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');

const corsOptions = {
	origin: 'http://localhost:3000'
};
const PORT = process.env.PORT || '1986';
const baseUrl = 'https://www.baseball-reference.com';
const playerData = JSON.parse(fs.readFileSync('players.json', { encoding: 'utf-8' }));

const server = express(/*cors()*/);

/**
 * Models and helper functions
 */
interface IStat {
	Name: string;
	Value: number;
}

interface IPlayerStats {
	Year: string;
	Stats: IStat[];
}

const Stats = {
	HomeRun: 'HR',
	Hits: 'H',
	Games: 'G',
	PlateAppearances: 'PA',
	AtBats: 'AB',
	Runs: 'R',
	Doubles: '2B',
	Triples: '3B',
	RunsBattedIn: 'RBI',
	StolenBases: 'SB',
	CaughtStealing: 'CS',
	Walks: 'BB',
	Strikeouts: 'SO',
	TotalBases: 'TB',
	SacFlys: 'SF'
};

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

const getPlayerStats = (url: string) => {
	return axios.get(url).then((response) => {
		if (response && response.data) {
			const $ = cheerio.load(response.data);

			const getWAR = (year) => $(`[id="batting_value.2022"]`);
			console.log('row:', $(`tr[id="batting_value.2022"]`).html());
			const getStandardBattingYears = (): any[] =>
				$('tr[id^="batting_standard."]').each((_, element) => $(element).html());
			const getStatByYear = (stat: string, year: string) =>
				$(`[id="${year}"] [data-stat="${stat}"]`).text();

			const playerStats: IPlayerStats[] = [];

			for (const row of getStandardBattingYears()) {
				const id = row.attribs.id;
				const year = id.split('.')[1];

				const stats: IStat[] = [];
				for (const stat in Stats) {
					const value = getStatByYear(Stats[stat], id);
					stats.push({
						Name: stat,
						Value: parseInt(value, 10)
					});
				}

				// const getWAR = (year) => $(`tr[id="batting_value.${year}"] [data-stat="WAR"]`);
				// console.log(getWAR(year));

				playerStats.push({
					Year: year,
					Stats: stats
				});
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
