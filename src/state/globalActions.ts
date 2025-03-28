import { createAsyncThunk } from '@reduxjs/toolkit';
import DataContext from '../model/DataContext';

export const copyToClipboard = createAsyncThunk(
	'global/copyToClipboard',
	async (arg: string, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		dataContext.state.copyToClipboard(arg);
	},
);

export const exitApp = createAsyncThunk(
	'global/exitApp',
	async (_, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		dataContext.state.exitApp();
	},
);