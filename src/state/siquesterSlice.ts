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

const initialState: SIQuesterState = {
	pack: {"name":"Тестовый пакет SIGame","version":"5","id":"a16f96e7-4616-47d0-8652-aee5196094af","restriction":"12+","date":"07.07.2022","publisher":"Группа, которая владеет пакетом","difficulty":5,"logo":"@sigame_-_ava_2019.png","language":"ru-RU","tags":[{"value":"Тема пакета 1"},{"value":"Тема пакета 2"}],"info":{"authors":[{"name":"Vladimir Khil"}],"comments":"Пакет, демонстрирующий основные возможности SIGame.\nКак видите, у пакета задан логотип (отображается в начале игры).\nТемы пакета и сложность позволяют проще найти этот пакет в библиотеках.\nВозрастное ограничение защищает автора пакета от претензий"},"rounds":[
		{"name":"1-й раунд", "type":"standart", "info":{"sources":[{"value":"Это источник раунда. Позволяет указать, откуда автор почерпнул идеи для вопросов. Авторы и источники объектов в пакете наследуются от вышестоящих объектов"}],"comments":"Это обычный раунд. Вопросы в нём выбираются из таблицы в классической версии игры или играются строго по очереди в упрощённой"},"themes":[{"name":"Вопросы разных типов","info":{"authors":[{"name":"Это автор темы (можно указать, если он отличается от автора всего пакета)"}],"comments":"Комментарий к теме. Он может содержать какую-то общую часть для всех вопросов (например, \"Назовите исполнителя\")"},"questions":[{"price":100,"info":{"comments":"Это комментарий к вопросу. Он будет показан на экране по окончании вопроса"},"params":{"question":{"items":[{"value":"Это текст вопроса"}]}},"right":{"answer":["А это правильный ответ"]}},{"price":200,"type":"stake","params":{"question":{"items":[{"value":"Это вопрос со ставкой. На него отвечает тот, кто сделает самую большую ставку. Ва-банк (All-in) перекрывается только большим ва-банком"}]}},"right":{"answer":["Ответ","Альтернативный ответ для зачёта человеком/компьютером"]},"wrong":{"answer":["Неправильная версия для незачёта/для бота"]}}]},{"name":"Контент вопросов","questions":[{"price":100,"params":{"question":{"items":[{"value":"Это обычный текст"}]}},"right":{"answer":["А это обычный ответ"]}},{"price":200,"params":{"question":{"items":[{"value":"Это устный текст. Он появится в игре как реплика ведущего","placement":"replic"},{"value":"А это второй фрагмент вопроса. Вопрос может состоять из нескольких фрагментов различных типов, следующих друг за другом. Можно указать длительность фрагмента в секундах (здесь - 8 секунд)","duration":"00:00:08"}]}},"right":{"answer":["Ответ"]}},{"price":300,"params":{"question":{"items":[{"type":"image","isRef":true,"value":"sample-boat-400x300.png"},{"placement":"replic","value":"Устный комментарий для изображения"}]}},"right":{"answer":["Изображение"]}}]}]},
		{"name":"Финал","type":"final","info":{"comments":"А это финальный раунд. Здесь игроки сыграют только одну (если в настройках не указано другое) из указанных тем. Они по очереди будут убирать темы раунда до тех пор, пока не останется одна. В каждой теме используется только первый вопрос. Его стоимость не играет роли (каждый игрок сделает собственную ставку на вопросе)"},"themes":[{"name":"Тема 1","questions":[{"price":0,"params":{"question":{"items":[{"value":"Вопрос финала 1"}]}},"right":{"answer":["Ответ финала 1"]}}]},{"name":"Тема 2","questions":[{"price":0,"params":{"question":{"items":[{"value":"Вопрос финала 2"}]}},"right":{"answer":["Ответ финала 2"]}}]},{"name":"Тема 3","questions":[{"price":0,"params":{"question":{"items":[{"value":"Вопрос финала 3"}]}},"right":{"answer":["Ответ финала 3"]}}]}]}]}  
};

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