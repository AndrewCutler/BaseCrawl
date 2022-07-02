
/**
 * Models and helper functions
 */
type TStat = 'HR' |
	'H' |
	'G' |
	'PA' |
	'AB' |
	'R' |
	'2B' |
	'3B' |
	'RBI' |
	'SB' |
	'CS' |
	'BB' |
	'SO' |
	'TB' |
	'SF' |
	'HBP' |
	'WAR' |
	'batting_avg' |
	'onbase_perc' |
	'slugging_perc' |
	'onbase_plus_slugging';

export type IStats = {
	[name in TStat & 'Year']: number;
}

export class PlayerStats {
	Ages: { [age: string]: IStats };
	Years: { [year: string]: IStats };

	constructor() {
		this.Ages = {};
		this.Years = {};
	}
}

export const STATS = new Set<TStat>([
	'HR',
	'H',
	'G',
	'PA',
	'AB',
	'R',
	'2B',
	'3B',
	'RBI',
	'SB',
	'CS',
	'BB',
	'SO',
	'TB',
	'SF',
	'HBP',
	'batting_avg',
	'onbase_perc',
	'slugging_perc',
	'onbase_plus_slugging',
]);
