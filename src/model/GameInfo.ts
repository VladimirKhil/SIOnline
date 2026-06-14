/** Defines played game information. */
export default interface GameInfo {
	/** Game date. */
	date: string;

	/** Package name. */
	packageName: string;

	/** Package authors. */
	packageAuthors: string[];

	/** Person name. */
	personName: string;

	/** Showman name. */
	showman: string;

	/** Game results. */
	results: Record<string, number>;
}