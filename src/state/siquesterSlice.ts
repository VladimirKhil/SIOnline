import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import JSZip from 'jszip';
import localization from '../model/resources/localization';
import { Package, parseXMLtoPackage, Round, Theme, Question, ContentParam, ContentItem } from '../model/siquester/package';
import { navigate } from '../utils/Navigator';
import Path from '../model/enums/Path';
import DataContext from '../model/DataContext';
import { createDefaultPackage, createDefaultZip } from '../model/siquester/packageGenerator';
import { downloadPackageAsSIQ } from '../model/siquester/packageExporter';

export interface SIQuesterState {
	zip?: JSZip;
	pack?: Package;
	roundIndex?: number;
	themeIndex?: number;
	questionIndex?: number;
	isPackageSelected?: boolean;
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

		thunkAPI.dispatch(navigate({ navigation: { path: Path.SIQuesterPackage }, saveState: true }));
		return { zip, pack };
	},
);

export const createNewPackage = createAsyncThunk(
	'siquester/createNewPackage',
	async (_, thunkAPI) => {
		const pack = createDefaultPackage();
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

export const siquesterSlice = createSlice({
	name: 'siquester',
	initialState,
	reducers: {
		updatePackageProperty: (state, action: { 
			payload: { 
				property: 'name' | 'version' | 'id' | 'restriction' | 'date' | 'publisher' | 'difficulty' | 'language' | 'contactUri'; 
				value: string | number 
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
	},
	extraReducers: builder => {
		builder.addCase(openFile.fulfilled, (state, action) => {
			state.zip = action.payload.zip;
			state.pack = action.payload.pack;
			state.roundIndex = undefined;
			state.themeIndex = undefined;
			state.questionIndex = undefined;
			state.isPackageSelected = false;
		});
		builder.addCase(createNewPackage.fulfilled, (state, action) => {
			state.zip = action.payload.zip;
			state.pack = action.payload.pack;
			state.roundIndex = undefined;
			state.themeIndex = undefined;
			state.questionIndex = undefined;
			state.isPackageSelected = false;
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
	updateInfoProperty,
	updateTag,
	updateContentItem,
	setCurrentItem,
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