import JSZip from 'jszip';
import { ContentPlacements, Package, Question, Round, RoundTypes, Theme } from './package';
import localization from '../resources/localization';

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

export function createDefaultPackage(): Package {
	const [currentDate] = new Date().toISOString().split('T');

	const pack: Package = {
		name: localization.package,
		version: '5',
		id: generateId(),
		restriction: '',
		date: currentDate,
		publisher: '',
		difficulty: 5,
		language: getFullCulture(),
		tags: [],
		rounds: []
	};

	// Create 3 rounds
	for (let roundIndex = 0; roundIndex < 3; roundIndex += 1) {
		const round: Round = {
			name: (roundIndex + 1).toString(),
			type: RoundTypes.Standard,
			themes: []
		};

		// Create 6 themes per round
		for (let themeIndex = 0; themeIndex < 6; themeIndex += 1) {
			const theme: Theme = {
				name: '',
				questions: []
			};

			// Create 5 questions per theme
			for (let questionIndex = 0; questionIndex < 5; questionIndex += 1) {
				const price = (questionIndex + 1) * 100; // 100, 200, 300, 400, 500
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

	// Create final round with 7 themes
	const finalRound: Round = {
		name: localization.final,
		type: RoundTypes.Final,
		themes: []
	};

	// Create 7 themes for final round
	for (let themeIndex = 0; themeIndex < 7; themeIndex += 1) {
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

	return pack;
}