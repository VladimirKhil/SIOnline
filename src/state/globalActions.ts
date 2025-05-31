import { createAsyncThunk } from '@reduxjs/toolkit';
import DataContext from '../model/DataContext';
import Constants from '../model/enums/Constants';
import { AppDispatch } from './store';
import { setStudiaBackgroundImageKey } from './settingsSlice';
import { userErrorChanged } from './commonSlice';
import getErrorMessage from '../utils/ErrorHelpers';

export const copyToClipboard = createAsyncThunk(
	'global/copyToClipboard',
	async (arg: string, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		dataContext.host.copyToClipboard(arg);
	},
);

export const copyUriToClipboard = createAsyncThunk(
	'global/copyUriToClipboard',
	async (arg: void, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		dataContext.host.copyUriToClipboard();
	},
);

export const openLink = createAsyncThunk(
	'global/openLink',
	async (arg: string, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		dataContext.host.openLink(arg);
	},
);

export const exitApp = createAsyncThunk(
	'global/exitApp',
	async (_, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		dataContext.host.exitApp();
	},
);

export const selectStudiaBackground = createAsyncThunk(
	'global/selectStudiaBackground',
	async (arg: File, thunkAPI) => {
		const appDispatch = thunkAPI.dispatch as AppDispatch;

		try {
			const buffer = await arg.arrayBuffer();
			const base64 = window.btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));

			const key = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString();

			localStorage.setItem(Constants.STUDIA_BACKGROUND_KEY, base64);
			localStorage.setItem(Constants.STUDIA_BACKGROUND_NAME_KEY, arg.name);

			appDispatch(setStudiaBackgroundImageKey(key));
		} catch (error) {
			appDispatch(userErrorChanged(getErrorMessage(error)) as any);
		}
	},
);

export const clearGameLog = createAsyncThunk(
	'global/clearGameLog',
	async (_, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		await dataContext.host.clearGameLog();
	}
);

export const addGameLog = createAsyncThunk(
	'global/addGameLog',
	async (message: string, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		dataContext.host.addGameLog(message, true);
	},
);

export const appendGameLog = createAsyncThunk(
	'global/addGameLog',
	async (message: string, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		dataContext.host.addGameLog(message, false);
	},
);

export const openGameLog = createAsyncThunk(
	'global/openGameLog',
	async (_, thunkAPI) => {
		const dataContext = thunkAPI.extra as DataContext;
		dataContext.host.openGameLog();
	},
);