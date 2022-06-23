
/**
 * Models and helper functions
 */
export interface IStats {
	[name: string]: number;
}

export interface ISeasonStats {
	Year: string;
	Stats: IStats;
}

export interface IPlayerStats {
	[age: string]: ISeasonStats;
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
