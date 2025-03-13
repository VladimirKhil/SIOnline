import { createAsyncThunk } from '@reduxjs/toolkit';
import DataContext from '../model/DataContext';

export const mediaPreloaded = createAsyncThunk(
	'server/mediaPreloaded',
	async (_, thunkAPI) => (thunkAPI.extra as DataContext).game.mediaPreloaded(),
);