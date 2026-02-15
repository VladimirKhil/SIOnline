import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import JSZip from 'jszip';
import SIStatisticsClient from 'sistatistics-client';
import QuestionStats from 'sistatistics-client/dist/models/QuestionStats';
import PackageTopLevelStats from 'sistatistics-client/dist/models/PackageTopLevelStats';
import localization from '../model/resources/localization';
import { Package, Round, Theme, Question, ContentParam, ContentItem } from '../model/siquester/package';
import { navigate } from '../utils/Navigator';
import Path from '../model/enums/Path';
import DataContext from '../model/DataContext';
import { createDefaultPackage, createDefaultZip, NewPackageOptions } from '../model/siquester/packageGenerator';

export type { NewPackageOptions };
import { downloadPackageAsSIQ } from '../model/siquester/packageExporter';
import { parseXMLtoPackage } from '../model/siquester/packageLoader';

export interface SIQuesterState {
	zip?: JSZip;
	pack?: Package;
	roundIndex?: number;
	themeIndex?: number;
	questionIndex?: number;
	isPackageSelected?: boolean;
	isNewPackage?: boolean;
	packageStats?: Record<string, QuestionStats>;
	packageTopLevelStats?: PackageTopLevelStats;
	packageStatsLoading?: boolean;
	showPackageStats?: boolean;
}

const initialState: SIQuesterState = {};

export const openFile = createAsyncThunk(
	'siquester/openFile',
	async (arg: File, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		dataContext.file = arg;
		const zip = new JSZip();
		await zip.loadAsync(arg);
		const contentFile = zip.file('content.xml');

		if (!contentFile) {
			throw new Error(localization.corruptedPackage + ' (!contentFile)');
		}

		const content = await contentFile.async('text');
		const parser = new DOMParser();
		const xmlDoc = parser.parseFromString(content, 'application/xml');
		const pack = parseXMLtoPackage(xmlDoc);

		const qualityMarkerFile = zip.file('quality.marker');

		if (qualityMarkerFile) {
			pack.isQualityMarked = true;
		}

		thunkAPI.dispatch(navigate({ navigation: { path: Path.SIQuesterPackage }, saveState: true }));
		return { zip, pack };
	},
);

export const createNewPackage = createAsyncThunk(
	'siquester/createNewPackage',
	async (options: NewPackageOptions, thunkAPI) => {
		const pack = createDefaultPackage(options);
		const zip = await createDefaultZip();

		thunkAPI.dispatch(navigate({ navigation: { path: Path.SIQuesterPackage }, saveState: true }));
		return { zip, pack };
	},
);

export const savePackage = createAsyncThunk(
	'siquester/savePackage',
	async (_, thunkAPI) => {
		const state = thunkAPI.getState() as { siquester: SIQuesterState };
		const { pack, zip } = state.siquester;

		if (!pack) {
			throw new Error('No package to save');
		}

		await downloadPackageAsSIQ(pack, zip);
	},
);

export const loadPackageStatistics = createAsyncThunk(
	'siquester/loadPackageStatistics',
	async (_, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		const state = thunkAPI.getState() as { siquester: SIQuesterState };
		const { pack } = state.siquester;

		if (!pack) {
			throw new Error('No package to load statistics for');
		}

		const siStatisticsClient = new SIStatisticsClient({ serviceUri: dataContext.config.siStatisticsServiceUri });

		const authors = pack.info?.authors?.map(a => a.name) || [];

		try {
			const packageStats = await siStatisticsClient.getPackageStats({
				name: pack.name,
				hash: '',
				authors
			});

			return packageStats;
		} catch (error: unknown) {
			// Return empty stats on 404 or other errors
			return {
				topLevelStats: { startedGameCount: 0, completedGameCount: 0 },
				questionStats: {}
			};
		}
	},
);

export const siquesterSlice = createSlice({
	name: 'siquester',
	initialState,
	reducers: {
		updatePackageProperty: (state, action: { 
			payload: { 
				property: 'name' | 'version' | 'id' | 'restriction' | 'date' | 'publisher' | 'difficulty' 
					| 'language' | 'contactUri' | 'isQualityMarked'; 
				value: string | number | boolean 
			} 
		}) => {
			if (state.pack) {
				switch (action.payload.property) {
					case 'name':
						state.pack.name = action.payload.value as string;
						break;
					case 'version':
						state.pack.version = action.payload.value as string;
						break;
					case 'id':
						state.pack.id = action.payload.value as string;
						break;
					case 'restriction':
						state.pack.restriction = action.payload.value as string;
						break;
					case 'date':
						state.pack.date = action.payload.value as string;
						break;
					case 'publisher':
						state.pack.publisher = action.payload.value as string;
						break;
					case 'difficulty':
						state.pack.difficulty = action.payload.value as number;
						break;
					case 'language':
						state.pack.language = action.payload.value as string;
						break;
					case 'contactUri':
						state.pack.contactUri = action.payload.value as string;
						break;
					case 'isQualityMarked':
						state.pack.isQualityMarked = action.payload.value as boolean;
						break;
					default:
						break;
				}
			}
		},
		updateRoundProperty: (state, action: { 
			payload: { roundIndex: number; property: 'name' | 'type'; value: string } 
		}) => {
			if (state.pack && state.pack.rounds[action.payload.roundIndex]) {
				const round = state.pack.rounds[action.payload.roundIndex];
				switch (action.payload.property) {
					case 'name':
						round.name = action.payload.value;
						break;
					case 'type':
						round.type = action.payload.value;
						break;
					default:
						break;
				}
			}
		},
		updateThemeProperty: (state, action: { 
			payload: { roundIndex: number; themeIndex: number; property: 'name'; value: string } 
		}) => {
			const theme = state.pack?.rounds[action.payload.roundIndex]?.themes[action.payload.themeIndex];
			if (theme) {
				theme.name = action.payload.value;
			}
		},
		updateQuestionProperty: (state, action: { 
			payload: { 
				roundIndex: number; 
				themeIndex: number; 
				questionIndex: number; 
				property: 'price' | 'type'; 
				value: string | number 
			} 
		}) => {
			const question = state.pack?.rounds[action.payload.roundIndex]
				?.themes[action.payload.themeIndex]?.questions[action.payload.questionIndex];
			if (question) {
				switch (action.payload.property) {
					case 'price':
						question.price = action.payload.value as number;
						break;
					case 'type':
						question.type = action.payload.value as string;
						break;
					default:
						break;
				}
			}
		},
		updateQuestionParam: (state, action: { 
			payload: { 
				roundIndex: number; 
				themeIndex: number; 
				questionIndex: number; 
				param: string; 
				value: string 
			} 
		}) => {
			const question = state.pack?.rounds[action.payload.roundIndex]
				?.themes[action.payload.themeIndex]?.questions[action.payload.questionIndex];
			if (question) {
				question.params[action.payload.param] = action.payload.value;

				// Clear answer options when switching away from select
				if (action.payload.param === 'answerType' &&
					action.payload.value !== 'select') {
					delete question.params.answerOptions;
				}
			}
		},
		updateQuestionRightAnswer: (state, action: { 
			payload: { 
				roundIndex: number; 
				themeIndex: number; 
				questionIndex: number; 
				answerIndex: number; 
				value: string 
			} 
		}) => {
			const question = state.pack?.rounds[action.payload.roundIndex]
				?.themes[action.payload.themeIndex]?.questions[action.payload.questionIndex];
			if (question) {
				question.right.answer[action.payload.answerIndex] = action.payload.value;
			}
		},
		updateQuestionWrongAnswer: (state, action: { 
			payload: { 
				roundIndex: number; 
				themeIndex: number; 
				questionIndex: number; 
				answerIndex: number; 
				value: string 
			} 
		}) => {
			const question = state.pack?.rounds[action.payload.roundIndex]
				?.themes[action.payload.themeIndex]?.questions[action.payload.questionIndex];
			if (question?.wrong) {
				question.wrong.answer[action.payload.answerIndex] = action.payload.value;
			}
		},
		addQuestionRightAnswer: (state, action: { 
			payload: { 
				roundIndex: number; 
				themeIndex: number; 
				questionIndex: number; 
			} 
		}) => {
			const question = state.pack?.rounds[action.payload.roundIndex]
				?.themes[action.payload.themeIndex]?.questions[action.payload.questionIndex];
			if (question) {
				question.right.answer.push('');
			}
		},
		removeQuestionRightAnswer: (state, action: { 
			payload: { 
				roundIndex: number; 
				themeIndex: number; 
				questionIndex: number; 
				answerIndex: number; 
			} 
		}) => {
			const question = state.pack?.rounds[action.payload.roundIndex]
				?.themes[action.payload.themeIndex]?.questions[action.payload.questionIndex];
			if (question && question.right.answer[action.payload.answerIndex] !== undefined) {
				question.right.answer.splice(action.payload.answerIndex, 1);
			}
		},
		addQuestionWrongAnswer: (state, action: { 
			payload: { 
				roundIndex: number; 
				themeIndex: number; 
				questionIndex: number; 
			} 
		}) => {
			const question = state.pack?.rounds[action.payload.roundIndex]
				?.themes[action.payload.themeIndex]?.questions[action.payload.questionIndex];
			if (question) {
				if (!question.wrong) {
					question.wrong = { answer: [] };
				}
				question.wrong.answer.push('');
			}
		},
		removeQuestionWrongAnswer: (state, action: { 
			payload: { 
				roundIndex: number; 
				themeIndex: number; 
				questionIndex: number; 
				answerIndex: number; 
			} 
		}) => {
			const question = state.pack?.rounds[action.payload.roundIndex]
				?.themes[action.payload.themeIndex]?.questions[action.payload.questionIndex];
			if (question?.wrong && question.wrong.answer[action.payload.answerIndex] !== undefined) {
				question.wrong.answer.splice(action.payload.answerIndex, 1);
			}
		},
		addRound: (state) => {
			if (state.pack) {
				const newRound: Round = {
					name: '',
					type: '',
					themes: []
				};
				state.pack.rounds.push(newRound);
			}
		},
		removeRound: (state, action: { payload: { roundIndex: number } }) => {
			if (state.pack && state.pack.rounds[action.payload.roundIndex]) {
				state.pack.rounds.splice(action.payload.roundIndex, 1);
				// Clear current item if it was in the deleted round
				if (state.roundIndex === action.payload.roundIndex) {
					state.roundIndex = undefined;
					state.themeIndex = undefined;
					state.questionIndex = undefined;
				}
			}
		},
		addTheme: (state, action: { payload: { roundIndex: number } }) => {
			const round = state.pack?.rounds[action.payload.roundIndex];
			if (round) {
				const newTheme: Theme = {
					name: '',
					questions: []
				};
				round.themes.push(newTheme);
			}
		},
		removeTheme: (state, action: { 
			payload: { 
				roundIndex: number; 
				themeIndex: number; 
			} 
		}) => {
			const round = state.pack?.rounds[action.payload.roundIndex];
			if (round && round.themes[action.payload.themeIndex]) {
				round.themes.splice(action.payload.themeIndex, 1);
				// Clear current item if it was in the deleted theme
				if (state.roundIndex === action.payload.roundIndex && state.themeIndex === action.payload.themeIndex) {
					state.themeIndex = undefined;
					state.questionIndex = undefined;
				}
			}
		},
		addQuestion: (state, action: { 
			payload: { 
				roundIndex: number; 
				themeIndex: number; 
				price?: number;
			} 
		}) => {
			const theme = state.pack?.rounds[action.payload.roundIndex]?.themes[action.payload.themeIndex];
			if (theme) {
				const newQuestion: Question = {
					price: action.payload.price ?? 0,
					params: {
						question: {
							items: [{
								type: 'text',
								value: '',
								isRef: false,
								placement: 'screen'
							}]
						}
					},
					right: {
						answer: ['']
					}
				};
				theme.questions.push(newQuestion);
			}
		},
		removeQuestion: (state, action: { 
			payload: { 
				roundIndex: number; 
				themeIndex: number; 
				questionIndex: number; 
			} 
		}) => {
			const theme = state.pack?.rounds[action.payload.roundIndex]?.themes[action.payload.themeIndex];
			if (theme && theme.questions[action.payload.questionIndex]) {
				theme.questions.splice(action.payload.questionIndex, 1);
				// Clear current item if it was the deleted question
				if (state.roundIndex === action.payload.roundIndex && 
					state.themeIndex === action.payload.themeIndex && 
					state.questionIndex === action.payload.questionIndex) {
					state.questionIndex = undefined;
				}
			}
		},
		updateInfoProperty: (state, action: { 
			payload: { 
				targetType: 'package' | 'round' | 'theme' | 'question'; 
				roundIndex?: number; 
				themeIndex?: number; 
				questionIndex?: number; 
				property: 'authors' | 'sources' | 'comments'; 
				index?: number; 
				value: string 
			} 
		}) => {
			let target: Package | Round | Theme | Question | null = null;
			
			if (action.payload.targetType === 'package') {
				target = state.pack || null;
			} else if (action.payload.targetType === 'round' && typeof action.payload.roundIndex === 'number') {
				target = state.pack?.rounds[action.payload.roundIndex] || null;
			} else if (action.payload.targetType === 'theme' && 
				typeof action.payload.roundIndex === 'number' && 
				typeof action.payload.themeIndex === 'number') {
				target = state.pack?.rounds[action.payload.roundIndex]?.themes[action.payload.themeIndex] || null;
			} else if (action.payload.targetType === 'question' && 
				typeof action.payload.roundIndex === 'number' && 
				typeof action.payload.themeIndex === 'number' && 
				typeof action.payload.questionIndex === 'number') {
				target = state.pack?.rounds[action.payload.roundIndex]
					?.themes[action.payload.themeIndex]?.questions[action.payload.questionIndex] || null;
			}
			
			if (target) {
				if (!target.info) {
					target.info = {};
				}
				
				if (action.payload.property === 'comments') {
					target.info.comments = action.payload.value;
				} else if (action.payload.property === 'authors' && typeof action.payload.index === 'number') {
					if (!target.info.authors) {
						target.info.authors = [];
					}
					if (target.info.authors[action.payload.index]) {
						target.info.authors[action.payload.index].name = action.payload.value;
					}
				} else if (action.payload.property === 'sources' && typeof action.payload.index === 'number') {
					if (!target.info.sources) {
						target.info.sources = [];
					}
					if (target.info.sources[action.payload.index]) {
						target.info.sources[action.payload.index].value = action.payload.value;
					}
				}
			}
		},
		updateTag: (state, action: { payload: { tagIndex: number; value: string } }) => {
			if (state.pack && state.pack.tags[action.payload.tagIndex]) {
				state.pack.tags[action.payload.tagIndex].value = action.payload.value;
			}
		},
		addTag: (state) => {
			if (state.pack) {
				state.pack.tags.push({ value: '' });
			}
		},
		removeTag: (state, action: { payload: { tagIndex: number } }) => {
			if (state.pack && state.pack.tags[action.payload.tagIndex] !== undefined) {
				state.pack.tags.splice(action.payload.tagIndex, 1);
			}
		},
		addInfoItem: (state, action: { 
			payload: { 
				targetType: 'package' | 'round' | 'theme' | 'question'; 
				roundIndex?: number; 
				themeIndex?: number; 
				questionIndex?: number; 
				property: 'authors' | 'sources'; 
			} 
		}) => {
			let target: Package | Round | Theme | Question | null = null;
			
			if (action.payload.targetType === 'package') {
				target = state.pack || null;
			} else if (action.payload.targetType === 'round' && typeof action.payload.roundIndex === 'number') {
				target = state.pack?.rounds[action.payload.roundIndex] || null;
			} else if (action.payload.targetType === 'theme' && 
				typeof action.payload.roundIndex === 'number' && 
				typeof action.payload.themeIndex === 'number') {
				target = state.pack?.rounds[action.payload.roundIndex]?.themes[action.payload.themeIndex] || null;
			} else if (action.payload.targetType === 'question' && 
				typeof action.payload.roundIndex === 'number' && 
				typeof action.payload.themeIndex === 'number' && 
				typeof action.payload.questionIndex === 'number') {
				target = state.pack?.rounds[action.payload.roundIndex]
					?.themes[action.payload.themeIndex]?.questions[action.payload.questionIndex] || null;
			}
			
			if (target) {
				if (!target.info) {
					target.info = {};
				}
				
				if (action.payload.property === 'authors') {
					if (!target.info.authors) {
						target.info.authors = [];
					}
					target.info.authors.push({ name: '' });
				} else if (action.payload.property === 'sources') {
					if (!target.info.sources) {
						target.info.sources = [];
					}
					target.info.sources.push({ value: '' });
				}
			}
		},
		removeInfoItem: (state, action: { 
			payload: { 
				targetType: 'package' | 'round' | 'theme' | 'question'; 
				roundIndex?: number; 
				themeIndex?: number; 
				questionIndex?: number; 
				property: 'authors' | 'sources'; 
				index: number; 
			} 
		}) => {
			let target: Package | Round | Theme | Question | null = null;
			
			if (action.payload.targetType === 'package') {
				target = state.pack || null;
			} else if (action.payload.targetType === 'round' && typeof action.payload.roundIndex === 'number') {
				target = state.pack?.rounds[action.payload.roundIndex] || null;
			} else if (action.payload.targetType === 'theme' && 
				typeof action.payload.roundIndex === 'number' && 
				typeof action.payload.themeIndex === 'number') {
				target = state.pack?.rounds[action.payload.roundIndex]?.themes[action.payload.themeIndex] || null;
			} else if (action.payload.targetType === 'question' && 
				typeof action.payload.roundIndex === 'number' && 
				typeof action.payload.themeIndex === 'number' && 
				typeof action.payload.questionIndex === 'number') {
				target = state.pack?.rounds[action.payload.roundIndex]
					?.themes[action.payload.themeIndex]?.questions[action.payload.questionIndex] || null;
			}
			
			if (target && target.info) {
				if (action.payload.property === 'authors' && target.info.authors && target.info.authors[action.payload.index] !== undefined) {
					target.info.authors.splice(action.payload.index, 1);
				} else if (action.payload.property === 'sources' && target.info.sources && target.info.sources[action.payload.index] !== undefined) {
					target.info.sources.splice(action.payload.index, 1);
				}
			}
		},
		updateContentItem: (state, action: { 
			payload: { 
				roundIndex: number; 
				themeIndex: number; 
				questionIndex: number; 
				paramName: string; 
				itemIndex: number; 
				property: 'value' | 'type' | 'duration' | 'placement' | 'isRef' | 'waitForFinish'; 
				value: string | boolean 
			} 
		}) => {
			const question = state.pack?.rounds[action.payload.roundIndex]
				?.themes[action.payload.themeIndex]?.questions[action.payload.questionIndex];
			if (question?.params[action.payload.paramName] && 'items' in question.params[action.payload.paramName]) {
				const param = question.params[action.payload.paramName] as ContentParam;
				if (param.items[action.payload.itemIndex]) {
					const item = param.items[action.payload.itemIndex];
					switch (action.payload.property) {
						case 'value':
							item.value = action.payload.value as string;
							break;
						case 'type':
							item.type = action.payload.value as ContentItem['type'];
							break;
						case 'duration':
							item.duration = action.payload.value as string;
							break;
						case 'placement':
							item.placement = action.payload.value as ContentItem['placement'];
							break;
						case 'isRef':
							item.isRef = action.payload.value as boolean;
							break;
						case 'waitForFinish':
							item.waitForFinish = action.payload.value as boolean;
							break;
						default:
							break;
					}
				}
			}
		},
		setCurrentItem: (state, action: {
			payload: {
				roundIndex?: number;
				themeIndex?: number;
				questionIndex?: number;
				isPackageSelected?: boolean;
			}
		}) => {
			state.roundIndex = action.payload.roundIndex;
			state.themeIndex = action.payload.themeIndex;
			state.questionIndex = action.payload.questionIndex;
			state.isPackageSelected = action.payload.isPackageSelected;
		},
		addContentScreen: (state, action: {
			payload: {
				roundIndex: number;
				themeIndex: number;
				questionIndex: number;
				paramName: string;
				afterScreenIndex: number;
			}
		}) => {
			const question = state.pack?.rounds[action.payload.roundIndex]
				?.themes[action.payload.themeIndex]?.questions[action.payload.questionIndex];

			if (question?.params[action.payload.paramName] && 'items' in question.params[action.payload.paramName]) {
				const param = question.params[action.payload.paramName] as ContentParam;
				// Find insertion point: count screen boundaries (waitForFinish items)
				let screenCount = 0;
				let insertIndex = param.items.length;

				for (let i = 0; i < param.items.length; i += 1) {
					if (param.items[i].waitForFinish) {
						screenCount += 1;

						if (screenCount === action.payload.afterScreenIndex + 1) {
							insertIndex = i + 1;
							break;
						}
					}
				}

				// If previous last item doesn't have waitForFinish, set it
				if (insertIndex > 0 && !param.items[insertIndex - 1].waitForFinish) {
					param.items[insertIndex - 1].waitForFinish = true;
				}

				// Insert a new text content item for the new screen
				const newItem: ContentItem = {
					type: 'text',
					value: '',
					isRef: false,
					placement: 'screen',
					waitForFinish: true,
				};

				param.items.splice(insertIndex, 0, newItem);
			}
		},
		removeContentScreen: (state, action: {
			payload: {
				roundIndex: number;
				themeIndex: number;
				questionIndex: number;
				paramName: string;
				screenIndex: number;
			}
		}) => {
			const question = state.pack?.rounds[action.payload.roundIndex]
				?.themes[action.payload.themeIndex]?.questions[action.payload.questionIndex];

			if (question?.params[action.payload.paramName] && 'items' in question.params[action.payload.paramName]) {
				const param = question.params[action.payload.paramName] as ContentParam;

				// Find the start and end indices of items belonging to the target screen
				let screenCount = 0;
				let screenStart = 0;
				let screenEnd = -1;

				for (let i = 0; i < param.items.length; i += 1) {
					if (param.items[i].waitForFinish) {
						if (screenCount === action.payload.screenIndex) {
							screenEnd = i;
							break;
						}

						screenCount += 1;
						screenStart = i + 1;
					}
				}

				// If we didn't find a waitForFinish for the last screen
				if (screenEnd === -1 && screenCount === action.payload.screenIndex) {
					screenEnd = param.items.length - 1;
				}

				if (screenEnd >= screenStart) {
					param.items.splice(screenStart, screenEnd - screenStart + 1);
				}
			}
		},
		addScreenContentItem: (state, action: {
			payload: {
				roundIndex: number;
				themeIndex: number;
				questionIndex: number;
				paramName: string;
				screenIndex: number;
			}
		}) => {
			const question = state.pack?.rounds[action.payload.roundIndex]
				?.themes[action.payload.themeIndex]?.questions[action.payload.questionIndex];

			if (question?.params[action.payload.paramName] && 'items' in question.params[action.payload.paramName]) {
				const param = question.params[action.payload.paramName] as ContentParam;
				// Find the last item index of the target screen
				let screenCount = 0;
				let insertIndex = param.items.length;

				for (let i = 0; i < param.items.length; i += 1) {
					if (param.items[i].waitForFinish) {
						if (screenCount === action.payload.screenIndex) {
							insertIndex = i;
							// Remove waitForFinish from this item since a new item will follow
							param.items[i].waitForFinish = false;
							break;
						}

						screenCount += 1;
					}
				}

				const newItem: ContentItem = {
					type: 'text',
					value: '',
					isRef: false,
					placement: 'screen',
					waitForFinish: true,
				};

				param.items.splice(insertIndex + 1, 0, newItem);
			}
		},
		removeScreenContentItem: (state, action: {
			payload: {
				roundIndex: number;
				themeIndex: number;
				questionIndex: number;
				paramName: string;
				itemIndex: number;
			}
		}) => {
			const question = state.pack?.rounds[action.payload.roundIndex]
				?.themes[action.payload.themeIndex]?.questions[action.payload.questionIndex];

			if (question?.params[action.payload.paramName] && 'items' in question.params[action.payload.paramName]) {
				const param = question.params[action.payload.paramName] as ContentParam;
				const idx = action.payload.itemIndex;

				if (idx >= 0 && idx < param.items.length && param.items.length > 1) {
					const removedItem = param.items[idx];

					// If the removed item had waitForFinish, transfer it to the previous item in the same screen
					if (removedItem.waitForFinish && idx > 0 && !param.items[idx - 1].waitForFinish) {
						param.items[idx - 1].waitForFinish = true;
					}

					param.items.splice(idx, 1);
				}
			}
		},
		addAnswerOption: (state, action: {
			payload: {
				roundIndex: number;
				themeIndex: number;
				questionIndex: number;
			}
		}) => {
			const question = state.pack?.rounds[action.payload.roundIndex]
				?.themes[action.payload.themeIndex]?.questions[action.payload.questionIndex];

			if (question) {
				if (!question.params.answerOptions) {
					question.params.answerOptions = {};
				}

				// Find the next available key (A, B, C, ...)
				const existingKeys = Object.keys(question.params.answerOptions);
				let nextKey = 'A';

				for (let i = 0; i < 26; i += 1) {
					const candidate = String.fromCharCode(65 + i);

					if (!existingKeys.includes(candidate)) {
						nextKey = candidate;
						break;
					}
				}

				question.params.answerOptions[nextKey] = {
					items: [{ type: 'text', value: '', isRef: false, placement: 'screen' }]
				};
			}
		},
		removeAnswerOption: (state, action: {
			payload: {
				roundIndex: number;
				themeIndex: number;
				questionIndex: number;
				key: string;
			}
		}) => {
			const question = state.pack?.rounds[action.payload.roundIndex]
				?.themes[action.payload.themeIndex]?.questions[action.payload.questionIndex];

			if (question?.params.answerOptions) {
				delete question.params.answerOptions[action.payload.key];

				if (Object.keys(question.params.answerOptions).length === 0) {
					delete question.params.answerOptions;
				}
			}
		},
		updateAnswerOptionValue: (state, action: {
			payload: {
				roundIndex: number;
				themeIndex: number;
				questionIndex: number;
				key: string;
				value: string;
			}
		}) => {
			const question = state.pack?.rounds[action.payload.roundIndex]
				?.themes[action.payload.themeIndex]?.questions[action.payload.questionIndex];

			if (question?.params.answerOptions?.[action.payload.key]) {
				const option = question.params.answerOptions[action.payload.key];

				if (option.items.length > 0) {
					option.items[0].value = action.payload.value;
				}
			}
		},
		togglePackageStats: (state) => {
			state.showPackageStats = !state.showPackageStats;
		},
	},
	extraReducers: builder => {
		builder.addCase(openFile.fulfilled, (state, action) => {
			state.zip = action.payload.zip;
			state.pack = action.payload.pack;
			state.roundIndex = undefined;
			state.themeIndex = undefined;
			state.questionIndex = undefined;
			state.isPackageSelected = false;
			state.isNewPackage = false;
			state.packageStats = undefined;
			state.packageTopLevelStats = undefined;
			state.showPackageStats = false;
		});
		builder.addCase(createNewPackage.fulfilled, (state, action) => {
			state.zip = action.payload.zip;
			state.pack = action.payload.pack;
			state.roundIndex = undefined;
			state.themeIndex = undefined;
			state.questionIndex = undefined;
			state.isPackageSelected = false;
			state.isNewPackage = true;
			state.packageStats = undefined;
			state.packageTopLevelStats = undefined;
			state.showPackageStats = false;
		});
		builder.addCase(loadPackageStatistics.pending, (state) => {
			state.packageStatsLoading = true;
		});
		builder.addCase(loadPackageStatistics.fulfilled, (state, action) => {
			state.packageStats = action.payload.questionStats;
			state.packageTopLevelStats = action.payload.topLevelStats;
			state.packageStatsLoading = false;
			state.showPackageStats = true;
		});
		builder.addCase(loadPackageStatistics.rejected, (state) => {
			state.packageStatsLoading = false;
		});
	},
});

export const {
	updatePackageProperty,
	updateRoundProperty,
	updateThemeProperty,
	updateQuestionProperty,
	updateQuestionParam,
	updateQuestionRightAnswer,
	updateQuestionWrongAnswer,
	addQuestionRightAnswer,
	removeQuestionRightAnswer,
	addQuestionWrongAnswer,
	removeQuestionWrongAnswer,
	addRound,
	removeRound,
	addTheme,
	removeTheme,
	addQuestion,
	removeQuestion,
	updateInfoProperty,
	updateTag,
	addTag,
	removeTag,
	addInfoItem,
	removeInfoItem,
	updateContentItem,
	addContentScreen,
	removeContentScreen,
	addScreenContentItem,
	removeScreenContentItem,
	addAnswerOption,
	removeAnswerOption,
	updateAnswerOptionValue,
	setCurrentItem,
	togglePackageStats,
} = siquesterSlice.actions;

// Selector to get the current item based on the indices
export const selectCurrentItem = (state: { siquester: SIQuesterState }): Package | Round | Theme | Question | null => {
	const { pack, roundIndex, themeIndex, questionIndex, isPackageSelected } = state.siquester;

	if (!pack) {
		return null;
	}

	// If no indices are set, check if package is explicitly selected
	if (roundIndex === undefined) {
		return isPackageSelected ? pack : null;
	}

	const round = pack.rounds[roundIndex];
	if (!round) {
		return null;
	}

	// If only roundIndex is set, return the round
	if (themeIndex === undefined) {
		return round;
	}

	const theme = round.themes[themeIndex];
	if (!theme) {
		return null;
	}

	// If roundIndex and themeIndex are set, return the theme
	if (questionIndex === undefined) {
		return theme;
	}

	const question = theme.questions[questionIndex];
	return question || null;
};

// Helper function to find indices of an item in the package structure
export const findItemIndices = (pack: Package | null, targetItem: Package | Round | Theme | Question | null): { 
	roundIndex?: number;
	themeIndex?: number;
	questionIndex?: number;
} => {
	if (!targetItem || !pack) {
		return {};
	}

	if ('rounds' in targetItem) {
		// Package
		return {};
	}

	// Find the item in the package structure
	for (const [rIndex, currentRound] of pack.rounds.entries()) {
		if (currentRound === targetItem) {
			// Round
			return { roundIndex: rIndex };
		}

		for (const [tIndex, currentTheme] of currentRound.themes.entries()) {
			if (currentTheme === targetItem) {
				// Theme
				return { roundIndex: rIndex, themeIndex: tIndex };
			}

			for (const [qIndex, currentQuestion] of currentTheme.questions.entries()) {
				if (currentQuestion === targetItem) {
					// Question
					return { roundIndex: rIndex, themeIndex: tIndex, questionIndex: qIndex };
				}
			}
		}
	}

	return {};
};

export default siquesterSlice.reducer;