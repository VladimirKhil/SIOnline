import JSZip from 'jszip';
import { ContentPlacements, Package, Question, Round, RoundTypes, Theme } from './package';
import localization from '../resources/localization';

export interface NewPackageOptions {
	packageName: string;
	authorName: string;
	roundCount: number;
	themeCount: number;
	questionCount: number;
	includeFinalRound: boolean;
	finalThemeCount: number;
}

export const defaultPackageOptions: NewPackageOptions = {
	packageName: '',
	authorName: '',
	roundCount: 3,
	themeCount: 6,
	questionCount: 5,
	includeFinalRound: true,
	finalThemeCount: 7,
};

function generateId(): string {
	return Math.random().toString(36).substr(2, 9);
}

function getFullCulture(): string {
	const culture = localization.getLanguage();

	switch (culture) {
		case 'ru':
			return 'ru-RU';
		case 'sr':
			return 'sr-RS';
		default:
			return 'en-US';
	}
}

export async function createDefaultZip(): Promise<JSZip> {
	const zip = new JSZip();

	return zip;
}

export function createDefaultPackage(options?: NewPackageOptions): Package {
	const opts = options || defaultPackageOptions;
	const [currentDate] = new Date().toISOString().split('T');

	const pack: Package = {
		name: opts.packageName || localization.package,
		version: '5',
		id: generateId(),
		restriction: '',
		date: currentDate,
		publisher: '',
		difficulty: 5,
		language: getFullCulture(),
		tags: [],
		rounds: [],
		isQualityMarked: true,
	};

	if (opts.authorName) {
		pack.info = {
			authors: [{ name: opts.authorName }]
		};
	}

	// Create standard rounds
	for (let roundIndex = 0; roundIndex < opts.roundCount; roundIndex += 1) {
		const round: Round = {
			name: (roundIndex + 1).toString(),
			type: RoundTypes.Standard,
			themes: []
		};

		// Create themes per round
		for (let themeIndex = 0; themeIndex < opts.themeCount; themeIndex += 1) {
			const theme: Theme = {
				name: '',
				questions: []
			};

			// Create questions per theme
			for (let questionIndex = 0; questionIndex < opts.questionCount; questionIndex += 1) {
				const price = (questionIndex + 1) * 100 * (roundIndex + 1); // Prices multiplied by round number
				const question: Question = {
					price,
					params: {
						question: {
							items: [{
								type: 'text',
								value: '',
								isRef: false,
								placement: ContentPlacements.Screen
							}]
						}
					},
					right: {
						answer: ['']
					}
				};

				theme.questions.push(question);
			}

			round.themes.push(theme);
		}

		pack.rounds.push(round);
	}

	// Create final round if enabled
	if (opts.includeFinalRound) {
		const finalRound: Round = {
			name: localization.final,
			type: RoundTypes.Final,
			themes: []
		};

		// Create themes for final round
		for (let themeIndex = 0; themeIndex < opts.finalThemeCount; themeIndex += 1) {
			const theme: Theme = {
				name: '',
				questions: []
			};

			// Create 1 question per theme in final round
			const question: Question = {
				price: 0, // Final round questions typically don't have prices
				params: {
					question: {
						items: [{
							type: 'text',
							value: '',
							isRef: false,
							placement: ContentPlacements.Screen
						}]
					}
				},
				right: {
					answer: ['']
				}
			};

			theme.questions.push(question);
			finalRound.themes.push(theme);
		}

		pack.rounds.push(finalRound);
	}

	return pack;
}