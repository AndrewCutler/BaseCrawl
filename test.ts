import Nightmare = require('nightmare');

const isDebug = process.argv[2] === 'debug';
const _Nightmare = require('nightmare');
const debugOptions = {
	show: true,
	openDevTools: {
		mode: 'detach'
	},
}
const nightmare: Nightmare = new _Nightmare(isDebug ? debugOptions : { show: false });

let logTest;
let getStandardSeasonRows;

nightmare
	.goto('https://www.baseball-reference.com/players/a/alonspe01.shtml')
	.inject('js', './helper.js')
	.wait('#batting_standard_sh')
	// .wait()
	.evaluate(() => {
		// return document.getElementById('batting_standard.2022');
		const rows = getStandardSeasonRows(['2021','2022']);
		return rows.map(row => (Array.from(row.children) as any[]).find(({ dataset: { stat } }) => stat === 'HR').outerText);
	})
	.end()
	.then(console.log)
	.catch(console.error);
