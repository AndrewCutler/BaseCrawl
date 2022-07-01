
/**
 * Models and helper functions
 */
export interface IStats {
	[name: string]: number;
}

interface IPlayerStats {
	Stats: IStats;
}

export interface IAgeStats extends IPlayerStats {
	Age: string;
}

export interface IYearStats extends IPlayerStats {
	Year: string;
}

export class PlayerStats {
	Ages: IAgeStats[];
	Years: IYearStats[];

	constructor() {
		this.Ages = [];
		this.Years = [];
	}
}

export const STATS = new Set<string>([
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
