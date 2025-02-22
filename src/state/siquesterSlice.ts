import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import JSZip from 'jszip';
import localization from '../model/resources/localization';
import { Package, parseXMLtoPackage } from '../model/siquester/package';
import { navigate } from '../utils/Navigator';
import Path from '../model/enums/Path';
import DataContext from '../model/DataContext';

export interface SIQuesterState {
	pack?: Package;
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
		return pack;
	},
);

export const siquesterSlice = createSlice({
	name: 'siquester',
	initialState,
	reducers: {},
	extraReducers: builder => {
		builder.addCase(openFile.fulfilled, (state, action) => {
			state.pack = action.payload;
		});
	},
});

export default siquesterSlice.reducer;