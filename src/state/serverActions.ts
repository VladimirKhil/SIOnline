import { createAsyncThunk } from '@reduxjs/toolkit';
import DataContext from '../model/DataContext';
import State from './State';
import { isSelectableChanged } from './tableSlice';
import { DecisionType, setDecisionType } from './room2Slice';
import JoinMode from '../client/game/JoinMode';

export const mediaPreloaded = createAsyncThunk(
	'server/mediaPreloaded',
	async (_, thunkAPI) => (thunkAPI.extra as DataContext).game.mediaPreloaded(),
);

export const mediaPreloadProgress = createAsyncThunk(
	'server/mediaPreloadProgress',
	async (progress: number, thunkAPI) => (thunkAPI.extra as DataContext).game.mediaPreloadProgress(progress),
);

export const deleteTable = createAsyncThunk(
	'server/deleteTable',
	async (arg: number, thunkAPI) => {
		if (arg < 0 || arg >= (thunkAPI.getState() as any).room2.persons.players.length) {
			return;
		}

		const dataContext = thunkAPI.extra as DataContext;
		await dataContext.game.deleteTable(arg);
	}
);

export const freeTable = createAsyncThunk(
	'server/freeTable',
	async (arg: { isShowman: boolean, tableIndex: number }, thunkAPI) => {
		if (arg.tableIndex < 0 || (!arg.isShowman && arg.tableIndex >= (thunkAPI.getState() as any).room2.persons.players.length)) {
			return;
		}

		const dataContext = thunkAPI.extra as DataContext;
		await dataContext.game.freeTable(arg.isShowman, arg.tableIndex);
	}
);

export const changeTableType = createAsyncThunk(
	'server/changeTableType',
	async (arg: { isShowman: boolean, tableIndex: number }, thunkAPI) => {
		if (arg.tableIndex < 0 || (!arg.isShowman && arg.tableIndex >= (thunkAPI.getState() as any).room2.persons.players.length)) {
			return;
		}

		const dataContext = thunkAPI.extra as DataContext;
		await dataContext.game.changeTableType(arg.isShowman, arg.tableIndex);
	}
);

export const pauseGame = createAsyncThunk(
	'server/pauseGame',
	async (arg: void, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		await dataContext.game.pause(!(thunkAPI.getState() as State).room2.stage.isGamePaused);
	}
);

export const setOption = createAsyncThunk(
	'server/setOption',
	async (arg: { name: string, value: string }, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		await dataContext.game.setOption(arg.name, arg.value);
	}
);

export const selectQuestion = createAsyncThunk(
	'server/selectQuestion',
	async (arg: { themeIndex: number, questionIndex: number }, thunkAPI) => {
		const { themeIndex, questionIndex } = arg;
		const state = thunkAPI.getState() as State;
		const dataContext = thunkAPI.extra as DataContext;

		if (!state.table.isSelectable) {
			return;
		}

		const theme = state.table.roundInfo[themeIndex];

		if (theme) {
			const question = theme.questions[questionIndex];

			if (question > -1) {
				if (await dataContext.game.selectQuestion(themeIndex, questionIndex)) {
					thunkAPI.dispatch(isSelectableChanged(false));
					thunkAPI.dispatch(setDecisionType(DecisionType.None));
				}
			}
		}
	}
);

export const selectTheme = createAsyncThunk(
	'server/selectTheme',
	async (themeIndex: number, thunkAPI) => {
		const state = thunkAPI.getState() as State;
		const dataContext = thunkAPI.extra as DataContext;

		if (!state.table.isSelectable) {
			return;
		}

		const theme = state.table.roundInfo[themeIndex];

		if (theme) {
			if (await dataContext.game.deleteTheme(themeIndex)) {
				thunkAPI.dispatch(isSelectableChanged(false));
				thunkAPI.dispatch(setDecisionType(DecisionType.None));
			}
		}
	}
);

export const selectAnswerOption = createAsyncThunk(
	'room2/selectAnswerOption',
	async (label: string, thunkAPI) => {
		const state = thunkAPI.getState() as State;
		const dataContext = thunkAPI.extra as DataContext;

		if (!state.table.isSelectable) {
			return;
		}

		if (await dataContext.game.sendAnswer(label)) {
			thunkAPI.dispatch(isSelectableChanged(false));
			thunkAPI.dispatch(setDecisionType(DecisionType.None));
		}
	},
);

export const sendJoinMode = createAsyncThunk(
	'server/sendJoinMode',
	async (joinMode: JoinMode, thunkAPI) => {
		const state = thunkAPI.getState() as State;
		const dataContext = thunkAPI.extra as DataContext;

		if (state.room2.joinMode !== joinMode) {
			await dataContext.game.setJoinMode(joinMode);
		}
	}
);

export const onMediaEnded = createAsyncThunk(
	'server/onMediaEnded',
	async (arg: { contentType: string, contentValue: string }, thunkAPI) =>{
		const dataContext = thunkAPI.extra as DataContext;
		await dataContext.game.onMediaCompleted(arg.contentType, arg.contentValue);
	}
);
