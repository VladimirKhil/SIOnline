import { createAsyncThunk } from '@reduxjs/toolkit';
import DataContext from '../model/DataContext';
import State from './State';

export const mediaPreloaded = createAsyncThunk(
	'server/mediaPreloaded',
	async (_, thunkAPI) => (thunkAPI.extra as DataContext).game.mediaPreloaded(),
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

export const pauseGame = createAsyncThunk(
	'server/pauseGame',
	async (arg: void, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		await dataContext.game.pause(!(thunkAPI.getState() as State).room2.stage.isGamePaused);
	}
);