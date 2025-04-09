import { createAsyncThunk } from '@reduxjs/toolkit';
import DataContext from '../model/DataContext';

export const copyToClipboard = createAsyncThunk(
	'global/copyToClipboard',
	async (arg: string, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		dataContext.state.copyToClipboard(arg);
	},
);

export const copyUriToClipboard = createAsyncThunk(
	'global/copyUriToClipboard',
	async (arg: void, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		dataContext.state.copyUriToClipboard();
	},
);

export const openLink = createAsyncThunk(
	'global/openLink',
	async (arg: string, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		dataContext.state.openLink(arg);
	},
);

export const exitApp = createAsyncThunk(
	'global/exitApp',
	async (_, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		dataContext.state.exitApp();
	},
);