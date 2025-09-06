import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import JSZip from 'jszip';
import localization from '../model/resources/localization';
import { Package, parseXMLtoPackage } from '../model/siquester/package';
import { navigate } from '../utils/Navigator';
import Path from '../model/enums/Path';
import DataContext from '../model/DataContext';
import { createDefaultPackage, createDefaultZip } from '../model/siquester/packageGenerator';
import { downloadPackageAsSIQ } from '../model/siquester/packageExporter';

export interface SIQuesterState {
	zip?: JSZip;
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
	reducers: {},
	extraReducers: builder => {
		builder.addCase(openFile.fulfilled, (state, action) => {
			state.zip = action.payload.zip;
			state.pack = action.payload.pack;
		});
		builder.addCase(createNewPackage.fulfilled, (state, action) => {
			state.zip = action.payload.zip;
			state.pack = action.payload.pack;
		});
	},
});

export default siquesterSlice.reducer;