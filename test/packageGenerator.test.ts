import { createDefaultPackage, defaultPackageOptions, NewPackageOptions } from '../src/model/siquester/packageGenerator';
import { RoundTypes } from '../src/model/siquester/package';

describe('createDefaultPackage', () => {
	test('returns a package with the correct structure', () => {
		const pack = createDefaultPackage();
		expect(pack).toHaveProperty('name');
		expect(pack).toHaveProperty('version', '5');
		expect(pack).toHaveProperty('id');
		expect(pack).toHaveProperty('rounds');
		expect(pack).toHaveProperty('tags');
		expect(Array.isArray(pack.rounds)).toBe(true);
		expect(Array.isArray(pack.tags)).toBe(true);
	});

	test('uses default options when none provided', () => {
		const pack = createDefaultPackage();
		// Default: 3 standard rounds + 1 final round = 4 rounds
		expect(pack.rounds.length).toBe(defaultPackageOptions.roundCount + 1);
	});

	test('generates a non-empty id', () => {
		const pack = createDefaultPackage();
		expect(pack.id.length).toBeGreaterThan(0);
	});

	test('generates unique ids for different calls', () => {
		const pack1 = createDefaultPackage();
		const pack2 = createDefaultPackage();
		// IDs are random so they should differ (probabilistically)
		// This test may occasionally fail, but it verifies uniqueness logic
		expect(pack1.id).not.toBe(pack2.id);
	});

	test('sets date to today in ISO format', () => {
		const pack = createDefaultPackage();
		const today = new Date().toISOString().split('T')[0];
		expect(pack.date).toBe(today);
	});

	test('creates standard rounds with correct type', () => {
		const pack = createDefaultPackage();
		const standardRounds = pack.rounds.filter(r => r.type === RoundTypes.Standard);
		expect(standardRounds.length).toBe(defaultPackageOptions.roundCount);
	});

	test('creates final round when includeFinalRound is true', () => {
		const pack = createDefaultPackage();
		const finalRounds = pack.rounds.filter(r => r.type === RoundTypes.Final);
		expect(finalRounds.length).toBe(1);
	});

	test('does not create final round when includeFinalRound is false', () => {
		const options: NewPackageOptions = { ...defaultPackageOptions, includeFinalRound: false };
		const pack = createDefaultPackage(options);
		const finalRounds = pack.rounds.filter(r => r.type === RoundTypes.Final);
		expect(finalRounds.length).toBe(0);
		expect(pack.rounds.length).toBe(defaultPackageOptions.roundCount);
	});

	test('each standard round has the correct number of themes', () => {
		const pack = createDefaultPackage();
		const standardRounds = pack.rounds.filter(r => r.type === RoundTypes.Standard);
		standardRounds.forEach(round => {
			expect(round.themes.length).toBe(defaultPackageOptions.themeCount);
		});
	});

	test('each theme has the correct number of questions', () => {
		const pack = createDefaultPackage();
		const standardRounds = pack.rounds.filter(r => r.type === RoundTypes.Standard);
		standardRounds.forEach(round => {
			round.themes.forEach(theme => {
				expect(theme.questions.length).toBe(defaultPackageOptions.questionCount);
			});
		});
	});

	test('question prices scale with round index', () => {
		const pack = createDefaultPackage();
		const standardRounds = pack.rounds.filter(r => r.type === RoundTypes.Standard);
		// First round: prices 100, 200, 300, 400, 500
		const firstRoundPrices = standardRounds[0].themes[0].questions.map(q => q.price);
		expect(firstRoundPrices).toEqual([100, 200, 300, 400, 500]);
		// Second round: prices 200, 400, 600, 800, 1000
		const secondRoundPrices = standardRounds[1].themes[0].questions.map(q => q.price);
		expect(secondRoundPrices).toEqual([200, 400, 600, 800, 1000]);
	});

	test('final round has correct number of themes', () => {
		const pack = createDefaultPackage();
		const finalRound = pack.rounds.find(r => r.type === RoundTypes.Final);
		expect(finalRound).toBeDefined();
		expect(finalRound!.themes.length).toBe(defaultPackageOptions.finalThemeCount);
	});

	test('final round themes have exactly 1 question each', () => {
		const pack = createDefaultPackage();
		const finalRound = pack.rounds.find(r => r.type === RoundTypes.Final);
		finalRound!.themes.forEach(theme => {
			expect(theme.questions.length).toBe(1);
			expect(theme.questions[0].price).toBe(0);
		});
	});

	test('sets author info when authorName is provided', () => {
		const options: NewPackageOptions = { ...defaultPackageOptions, authorName: 'John Doe' };
		const pack = createDefaultPackage(options);
		expect(pack.info).toBeDefined();
		expect(pack.info!.authors).toHaveLength(1);
		expect(pack.info!.authors![0].name).toBe('John Doe');
	});

	test('does not set info when authorName is empty', () => {
		const options: NewPackageOptions = { ...defaultPackageOptions, authorName: '' };
		const pack = createDefaultPackage(options);
		expect(pack.info).toBeUndefined();
	});

	test('uses custom packageName when provided', () => {
		const options: NewPackageOptions = { ...defaultPackageOptions, packageName: 'My Quiz' };
		const pack = createDefaultPackage(options);
		expect(pack.name).toBe('My Quiz');
	});

	test('each question has text content item', () => {
		const pack = createDefaultPackage();
		const firstQuestion = pack.rounds[0].themes[0].questions[0];
		expect(firstQuestion.params.question).toBeDefined();
		expect(firstQuestion.params.question!.items).toHaveLength(1);
		expect(firstQuestion.params.question!.items[0].type).toBe('text');
	});

	test('each question has a right answer', () => {
		const pack = createDefaultPackage();
		pack.rounds.forEach(round => {
			round.themes.forEach(theme => {
				theme.questions.forEach(question => {
					expect(question.right).toBeDefined();
					expect(Array.isArray(question.right.answer)).toBe(true);
				});
			});
		});
	});

	test('uses custom round, theme, question counts', () => {
		const options: NewPackageOptions = {
			packageName: '',
			authorName: '',
			roundCount: 2,
			themeCount: 3,
			questionCount: 4,
			includeFinalRound: false,
			finalThemeCount: 5,
		};
		const pack = createDefaultPackage(options);
		expect(pack.rounds.length).toBe(2);
		expect(pack.rounds[0].themes.length).toBe(3);
		expect(pack.rounds[0].themes[0].questions.length).toBe(4);
	});
});

describe('defaultPackageOptions', () => {
	test('has expected default values', () => {
		expect(defaultPackageOptions.roundCount).toBe(3);
		expect(defaultPackageOptions.themeCount).toBe(6);
		expect(defaultPackageOptions.questionCount).toBe(5);
		expect(defaultPackageOptions.includeFinalRound).toBe(true);
		expect(defaultPackageOptions.finalThemeCount).toBe(7);
	});
});
