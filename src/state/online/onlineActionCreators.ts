import { Action, ActionCreator, Dispatch } from 'redux';
import * as OnlineActions from './OnlineActions';
import IGameServerClient from '../../client/IGameServerClient';
import Slice from '../../client/contracts/Slice';
import GameInfo from '../../client/contracts/GameInfo';
import State from '../State';
import DataContext from '../../model/DataContext';
import uiActionCreators from '../ui/uiActionCreators';
import getErrorMessage from '../../utils/ErrorHelpers';
import OnlineMode from '../../model/enums/OnlineMode';
import localization from '../../model/resources/localization';
import GamesFilter from '../../model/enums/GamesFilter';
import SIContentClient from 'sicontent-client';
import PackageInfo from '../../client/contracts/PackageInfo';
import PackageKey from '../../client/contracts/PackageKey';
import JSZip from 'jszip';
import { ThunkAction } from 'redux-thunk';
import AccountSettings from '../../client/contracts/AccountSettings';
import Role from '../../client/contracts/Role';
import Constants from '../../model/enums/Constants';
import ServerAppSettings from '../../client/contracts/ServerAppSettings';
import GameType from '../../client/contracts/GameType';
import { getFullCulture } from '../../utils/StateHelpers';
import GameSettings from '../../client/contracts/GameSettings';
import PackageType from '../../model/enums/PackageType';
import PackageType2 from '../../client/contracts/PackageType';
import GameCreationResult from '../../client/contracts/GameCreationResult';
import Sex from '../../model/enums/Sex';
import ChatMode from '../../model/enums/ChatMode';
import hashData from '../../utils/hashData';
import tableActionCreators from '../table/tableActionCreators';
import roomActionCreators from '../room/roomActionCreators';
import * as GameErrorsHelper from '../../utils/GameErrorsHelper';
import actionCreators from '../actionCreators';

const selectGame: ActionCreator<OnlineActions.SelectGameAction> = (gameId: number) => ({
	type: OnlineActions.OnlineActionTypes.SelectGame,
	gameId
});

const clearGames: ActionCreator<OnlineActions.ClearGamesAction> = () => ({
	type: OnlineActions.OnlineActionTypes.ClearGames
});

const receiveGames: ActionCreator<OnlineActions.ReceiveGamesAction> = (games: any[]) => ({
	type: OnlineActions.OnlineActionTypes.ReceiveGames,
	games
});

async function loadGamesAsync(dispatch: Dispatch<OnlineActions.KnownOnlineAction>, gameClient: IGameServerClient) {
	dispatch(clearGames());

	let gamesSlice: Slice<GameInfo> = { data: [], isLastSlice: false };
	let whileGuard = 100;
	do {
		const fromId = gamesSlice.data.length > 0 ? gamesSlice.data[gamesSlice.data.length - 1].gameID + 1 : 0;

		gamesSlice = await gameClient.getGamesSliceAsync(fromId);

		dispatch(receiveGames(gamesSlice.data));

		whileGuard--;
	} while (!gamesSlice.isLastSlice && whileGuard > 0);
}

const onlineLoadFinish: ActionCreator<OnlineActions.OnlineLoadFinishedAction> = () => ({
	type: OnlineActions.OnlineActionTypes.OnlineLoadFinished
});

const onlineLoadError: ActionCreator<OnlineActions.OnlineLoadErrorAction> = (error: string) => ({
	type: OnlineActions.OnlineActionTypes.OnlineLoadError,
	error
});

const dropSelectedGame: ActionCreator<OnlineActions.DropSelectedGameAction> = () => ({
	type: OnlineActions.OnlineActionTypes.DropSelectedGame
});

const friendsPlay: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	() => async (dispatch: Dispatch<Action>, getState: () => State, dataContext: DataContext) => {
	const state = getState();
	const { selectedGameId } = state.online;

	dispatch(uiActionCreators.friendsPlayInternal());
	dispatch(dropSelectedGame());


	try {
		await loadGamesAsync(dispatch, dataContext.gameClient);

		const state2 = getState();

		if (selectedGameId && state2.online.games[selectedGameId]) {
			dispatch(selectGame(selectedGameId));
		}

		dispatch(onlineLoadFinish());
	} catch (error) {
		dispatch(onlineLoadError(getErrorMessage(error)));
	}
};

const resetLobby: ActionCreator<OnlineActions.ResetLobbyAction> = () => ({
	type: OnlineActions.OnlineActionTypes.ResetLobby
});

const navigateToLobby: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	(gameId: number, showInfo?: boolean) => async (dispatch: Dispatch<Action>, _: () => State, dataContext: DataContext) => {
		dispatch(uiActionCreators.navigateToLobbyInternal());
		dispatch(resetLobby());

		if (gameId > -1) {
			dispatch(selectGame(gameId));

			if (showInfo) {
				dispatch(uiActionCreators.onOnlineModeChanged(OnlineMode.GameInfo));
			}
		} else if (dataContext.config.rewriteUrl) {
			window.history.pushState({}, '', dataContext.config.rootUri);
		}

		// Games filtering is performed on client
		try {
			await loadGamesAsync(dispatch, dataContext.gameClient);

			const users = await dataContext.gameClient.getUsersAsync();
			const sortedUsers = users.sort((user1: string, user2: string) => user1.localeCompare(user2));

			dispatch(receiveUsers(sortedUsers));

			const news = await dataContext.gameClient.getNewsAsync();

			if (news !== null) {
				dispatch(receiveMessage(localization.news, news));
			}

			dispatch(onlineLoadFinish());
		} catch (error) {
			dispatch(onlineLoadError(getErrorMessage(error)));
		}
	};

const receiveUsers: ActionCreator<OnlineActions.ReceiveUsersAction> = (users: string[]) => ({
	type: OnlineActions.OnlineActionTypes.ReceiveUsers,
	users
});

const receiveMessage: ActionCreator<OnlineActions.ReceiveMessageAction> = (sender: string, message: string) => ({
	type: OnlineActions.OnlineActionTypes.ReceiveMessage,
	sender,
	message
});

const onGamesFilterToggle: ActionCreator<OnlineActions.GamesFilterToggleAction> = (filter: GamesFilter) => ({
	type: OnlineActions.OnlineActionTypes.GamesFilterToggle,
	filter
});

const onGamesSearchChanged: ActionCreator<OnlineActions.GamesSearchChangedAction> = (search: string) => ({
	type: OnlineActions.OnlineActionTypes.GamesSearchChanged,
	search
});

const unselectGame: ActionCreator<OnlineActions.UnselectGameAction> = () => ({
	type: OnlineActions.OnlineActionTypes.UnselectGame
});

const newGame: ActionCreator<OnlineActions.NewGameAction> = () => ({
	type: OnlineActions.OnlineActionTypes.NewGame
});

const newGameCancel: ActionCreator<OnlineActions.NewGameCancelAction> = () => ({
	type: OnlineActions.OnlineActionTypes.NewGameCancel
});

const passwordChanged: ActionCreator<OnlineActions.PasswordChangedAction> = (newPassword: string) => ({
	type: OnlineActions.OnlineActionTypes.PasswordChanged,
	newPassword
});

const chatModeChanged: ActionCreator<OnlineActions.ChatModeChangedAction> = (chatMode: ChatMode) => ({
	type: OnlineActions.OnlineActionTypes.ChatModeChanged,
	chatMode
});

const gameCreated: ActionCreator<OnlineActions.GameCreatedAction> = (game: GameInfo) => ({
	type: OnlineActions.OnlineActionTypes.GameCreated,
	game
});

const gameChanged: ActionCreator<OnlineActions.GameChangedAction> = (game: GameInfo) => ({
	type: OnlineActions.OnlineActionTypes.GameChanged,
	game
});

const gameDeleted: ActionCreator<OnlineActions.GameDeletedAction> = (gameId: number) => ({
	type: OnlineActions.OnlineActionTypes.GameDeleted,
	gameId
});

const userJoined: ActionCreator<OnlineActions.UserJoinedAction> = (login: string) => ({
	type: OnlineActions.OnlineActionTypes.UserJoined,
	login
});

const userLeaved: ActionCreator<OnlineActions.UserLeavedAction> = (login: string) => ({
	type: OnlineActions.OnlineActionTypes.UserLeaved,
	login
});

const messageChanged: ActionCreator<OnlineActions.MessageChangedAction> = (message: string) => ({
	type: OnlineActions.OnlineActionTypes.MessageChanged,
	message
});

const sendMessage: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	() => (dispatch: Dispatch<OnlineActions.KnownOnlineAction>, getState: () => State, dataContext: DataContext) => {
		const state = getState();

		const text = state.online.currentMessage.trim();
		if (text.length > 0) {
			dataContext.gameClient.sayInLobbyAsync(text);
		}

		dispatch(messageChanged(''));
	};

const gameCreationStart: ActionCreator<OnlineActions.GameCreationStartAction> = () => ({
	type: OnlineActions.OnlineActionTypes.GameCreationStart
});

const gameCreationEnd: ActionCreator<OnlineActions.GameCreationEndAction> = (error: string | null = null) => ({
	type: OnlineActions.OnlineActionTypes.GameCreationEnd,
	error
});

const uploadPackageStarted: ActionCreator<OnlineActions.UploadPackageStartedAction> = () => ({
	type: OnlineActions.OnlineActionTypes.UploadPackageStarted
});

const uploadPackageFinished: ActionCreator<OnlineActions.UploadPackageFinishedAction> = () => ({
	type: OnlineActions.OnlineActionTypes.UploadPackageFinished
});

const uploadPackageProgress: ActionCreator<OnlineActions.UploadPackageProgressAction> = (progress: number) => ({
	type: OnlineActions.OnlineActionTypes.UploadPackageProgress,
	progress
});

function uploadPackageAsync(
	packageHash: string,
	packageData: File,
	serverUri: string,
	dispatch: Dispatch<any>
): Promise<boolean> {
	dispatch(uploadPackageStarted());

	const formData = new FormData();
	formData.append('file', packageData, packageData.name);

	// fetch() does not support reporting progress right now
	// Switch to fetch() when progress support would be implemented
	// const response = await fetch(`${serverUri}/api/upload/package`, {
	// 	method: 'POST',
	// 	credentials: 'include',
	// 	body: formData,
	// 	headers: {
	// 		'Content-MD5': hashArrayEncoded
	// 	}
	// });

	// if (!response.ok) {
	// 	throw new Error(`${localization.uploadingPackageError}: ${response.status} ${await response.text()}`);
	// }

	return new Promise<boolean>((resolve, reject) => {
		const xhr = new XMLHttpRequest();

		xhr.onload = () => {
			dispatch(uploadPackageFinished());
			if (xhr.status >= 200 && xhr.status < 300) {
				resolve(true);
			} else {
				reject(new Error(xhr.response));
			}
		};

		xhr.onerror = () => {
			dispatch(uploadPackageFinished());
			reject(new Error(xhr.statusText || xhr.responseText || `${localization.unknownError}: ${xhr.status}`));
		};

		xhr.upload.onprogress = (e) => {
			dispatch(uploadPackageProgress(e.loaded / e.total));
		};

		xhr.open('post', `${serverUri}/api/upload/package`, true);
		xhr.setRequestHeader('Content-MD5', packageHash);
		xhr.withCredentials = true;
		xhr.send(formData);
	});
}

async function uploadPackageAsync2(
	contentClient: SIContentClient,
	packageData: File,
	dispatch: Dispatch<any>
): Promise<PackageInfo> {
	const packageUri = await contentClient.uploadPackageIfNotExistAsync(
		packageData.name,
		packageData,
		() => dispatch(uploadPackageStarted()),
		(progress: number) => {
			dispatch(uploadPackageProgress(progress));
		},
		() => dispatch(uploadPackageFinished())
	);

	return {
		type: PackageType2.Content,
		uri: packageUri,
		contentServiceUri: contentClient.options.serviceUri,
		secret: null
	};
}

async function checkAndUploadPackageAsync(
	gameClient: IGameServerClient,
	serverUri: string,
	packageData: File,
	dispatch: Dispatch<any>
): Promise<PackageKey> {
	const zip = new JSZip();
	await zip.loadAsync(packageData);
	const contentFile = zip.file('content.xml');

	if (!contentFile) {
		throw new Error(localization.corruptedPackage + ' (!contentFile)');
	}

	const content = await contentFile.async('text');

	const parser = new DOMParser();
	const xmlDoc = parser.parseFromString(content.substring(39), 'application/xml');

	const packageElements = xmlDoc.getElementsByTagName('package');

	if (packageElements.length === 0) {
		throw new Error(localization.corruptedPackage + ' (packageElements.length === 0)');
	}

	const id = packageElements[0].getAttribute('id');

	const hash = await hashData(await packageData.arrayBuffer());

	const hashArray = new Uint8Array(hash);
	const hashArrayEncoded = window.btoa(String.fromCharCode.apply(null, hashArray as any));

	const packageKey: PackageKey = {
		name: packageData.name,
		hash: hashArrayEncoded,
		id
	};

	const hasPackage = await gameClient.hasPackageAsync(packageKey);

	if (!hasPackage) {
		await uploadPackageAsync(hashArrayEncoded, packageData, serverUri, dispatch);
	}

	return packageKey;
}

function getRandomValue(): number {
	const array = new Uint32Array(1);
	crypto.getRandomValues(array);

	return array[0];
}

const initGameAsync = async (dispatch: Dispatch<any>, dataContext: DataContext, gameId: number, role: Role, isAutomatic: boolean) => {
	dispatch(actionCreators.gameSet(gameId, isAutomatic));
	dispatch(uiActionCreators.navigateToGame());
	dispatch(tableActionCreators.tableReset());
	dispatch(tableActionCreators.showText(localization.tableHint, false));
	dispatch(roomActionCreators.roleChanged(role));
	dispatch(roomActionCreators.stopTimer(0));
	dispatch(roomActionCreators.stopTimer(1));
	dispatch(roomActionCreators.stopTimer(2));
	dispatch(roomActionCreators.gameStarted(false));

	await gameInit(gameId, dataContext, role);
};

const joinGame: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	(gameId: number, role: Role) => async (dispatch: Dispatch<any>, getState: () => State, dataContext: DataContext) => {
	dispatch(joinGameStarted());

	try {
		const state = getState();

		const result = await dataContext.gameClient.joinGameAsync(
			gameId,
			role,
			state.settings.sex === Sex.Male,
			state.online.password
		);

		if (result.errorMessage) {
			dispatch(joinGameFinished(`${localization.joinError}: ${result.errorMessage}`));
			return;
		}

		await initGameAsync(dispatch, dataContext, gameId, role, false);

		actionCreators.saveStateToStorage(state);
		dispatch(joinGameFinished(null));
	} catch (error) {
		dispatch(joinGameFinished(getErrorMessage(error)));
	}
};

const createNewGame: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	(isSingleGame: boolean) => async (dispatch: Dispatch<any>, getState: () => State, dataContext: DataContext) => {
		const state = getState();

		if (!isSingleGame && state.game.name.length === 0) {
			dispatch(gameCreationEnd(localization.gameNameMustBeSpecified));
			return;
		}

		if (state.common.computerAccounts === null) {
			dispatch(gameCreationEnd(localization.computerAccountsMissing));
			return;
		}

		dispatch(gameCreationStart());

		const game = isSingleGame
			? {
				...state.game,
				name: getRandomValue().toString(),
				password: getRandomValue().toString(), // protecting from anyone to join
				isShowmanHuman: false,
				humanPlayersCount: 0
			} : state.game;

		const { playersCount, humanPlayersCount, role } = game;
		const me: AccountSettings = { name: state.user.login, isHuman: true, isMale: state.settings.sex === Sex.Male };

		const showman: AccountSettings = role === Role.Showman
			? me
			: game.isShowmanHuman
				? { name: Constants.ANY_NAME, isHuman: true }
				: { name: localization.defaultShowman };

		const players: AccountSettings[] = [];
		const viewers: AccountSettings[] = [];

		if (role === Role.Viewer) {
			viewers.push(me);
		} else if (role === Role.Player) {
			players.push(me);
		}

		const compPlayersCount = playersCount - humanPlayersCount - (role === Role.Player ? 1 : 0);

		const compIndicies = [];

		for (let i = 0; i < state.common.computerAccounts.length; i++) {
			compIndicies.push(i);
		}

		for (let i = 0; i < humanPlayersCount; i++) {
			players.push({ name: Constants.ANY_NAME, isHuman: true });
		}

		for (let i = 0; i < compPlayersCount; i++) {
			const ind = Math.floor(Math.random() * compIndicies.length);
			players.push({ name: state.common.computerAccounts[compIndicies[ind]], isHuman: false });
			compIndicies.splice(ind, 1);
		}

		const gameMode = game.type;

		const appSettings: ServerAppSettings = {
			timeSettings: state.settings.appSettings.timeSettings,
			readingSpeed: state.settings.appSettings.readingSpeed,
			falseStart: state.settings.appSettings.falseStart,
			hintShowman: state.settings.appSettings.hintShowman,
			oral: state.settings.appSettings.oral,
			oralPlayersActions: state.settings.appSettings.oralPlayersActions,
			ignoreWrong: state.settings.appSettings.ignoreWrong,
			managed: state.settings.appSettings.managed,
			gameMode: gameMode.toString(),
			partialText: state.settings.appSettings.partialText,
			playAllQuestionsInFinalRound: state.settings.appSettings.playAllQuestionsInFinalRound,
			allowEveryoneToPlayHiddenStakes: state.settings.appSettings.allowEveryoneToPlayHiddenStakes,
			displaySources: state.settings.appSettings.displaySources,
			randomQuestionsBasePrice: gameMode === GameType.Simple ? 10 : 100,
			randomRoundsCount: gameMode === GameType.Simple ? 1 : 3,
			randomThemesCount: gameMode === GameType.Simple ? 5 : 6,
			culture: getFullCulture(state),
			usePingPenalty: state.settings.appSettings.usePingPenalty,
			preloadRoundContent: state.settings.appSettings.preloadRoundContent,
			useApellations: state.settings.appSettings.useApellations,
		};

		const gameSettings: GameSettings = {
			humanPlayerName: state.user.login,
			randomSpecials: game.package.type === PackageType.Random,
			networkGameName: game.name.trim(),
			networkGamePassword: game.password,
			networkVoiceChat: game.voiceChat,
			isPrivate: isSingleGame,
			allowViewers: true,
			showman: showman,
			players: players,
			viewers: viewers,
			appSettings: appSettings
		};

		let result: GameCreationResult;

		try {
			if (dataContext.contentClient && game.package.type === PackageType.File && game.package.data) {
				const packageInfo = await uploadPackageAsync2(dataContext.contentClient, game.package.data, dispatch);

				result = await dataContext.gameClient.createAndJoinGame2Async(
					gameSettings,
					packageInfo,
					state.settings.sex === Sex.Male
				);
			} else {
				const packageKey: PackageKey | null = await (async (): Promise<PackageKey | null> => {
					switch (game.package.type) {
						case PackageType.Random:
							return {
								name: '',
								hash: null,
								id: null
							};

						case PackageType.File:
							return game.package.data
								? checkAndUploadPackageAsync(
									dataContext.gameClient,
									dataContext.serverUri,
									game.package.data,
									dispatch
								) : null;

						case PackageType.SIStorage:
							return {
								name: null,
								hash: null,
								id: game.package.id
							};

						default:
							return null;
					}
				})();

				if (!packageKey) {
					dispatch(gameCreationEnd(localization.badPackage));
					return;
				}

				result = await dataContext.gameClient.createAndJoinGameAsync(
					gameSettings,
					packageKey,
					state.settings.sex === Sex.Male
				);
			}

			actionCreators.saveStateToStorage(state);
			dispatch(gameCreationEnd());

			if (result.code > 0) {
				dispatch(gameCreationEnd(GameErrorsHelper.getMessage(result.code) + (result.errorMessage || '')));
			} else {
				dispatch(newGameCancel());
				await initGameAsync(dispatch, dataContext, result.gameId, role, false);
			}
		} catch (error) {
			dispatch(gameCreationEnd(getErrorMessage(error)));
		}
	};

const createNewAutoGame: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	() => async (dispatch: Dispatch<any>, getState: () => State, dataContext: DataContext) => {
		const state = getState();

		dispatch(gameCreationStart());

		try {
			const result = await dataContext.gameClient.createAutomaticGameAsync(
				state.user.login,
				state.settings.sex === Sex.Male
			);

			actionCreators.saveStateToStorage(state);

			dispatch(gameCreationEnd());
			if (result.code > 0) {
				alert(GameErrorsHelper.getMessage(result.code) + (result.errorMessage || ''));
			} else {
				await initGameAsync(dispatch, dataContext, result.gameId, Role.Player, true);
			}
		} catch (message) {
			dispatch(gameCreationEnd(message));
		}
	};

async function gameInit(gameId: number, dataContext: DataContext, role: Role) {
	if (dataContext.config.rewriteUrl) {
		window.history.pushState({}, `${localization.game} ${gameId}`, `${dataContext.config.rootUri}?gameId=${gameId}`);
	}

	await dataContext.gameClient.sendMessageToServerAsync('INFO');

	if (role === Role.Player || role === Role.Showman) {
		await dataContext.gameClient.sendMessageToServerAsync('READY');
	}
}

const joinGameStarted: ActionCreator<OnlineActions.JoinGameStartedAction> = () => ({
	type: OnlineActions.OnlineActionTypes.JoinGameStarted
});

const joinGameFinished: ActionCreator<OnlineActions.JoinGameFinishedAction> = (error: string | null) => ({
	type: OnlineActions.OnlineActionTypes.JoinGameFinished,
	error
});

const onlineActionCreators = {
	friendsPlay,
	navigateToLobby,
	onGamesFilterToggle,
	onGamesSearchChanged,
	selectGame,
	unselectGame,
	newGame,
	newGameCancel,
	joinGame,
	passwordChanged,
	chatModeChanged,
	gameCreated,
	gameChanged,
	gameDeleted,
	userJoined,
	userLeaved,
	messageChanged,
	sendMessage,
	receiveMessage,
	createNewGame,
	createNewAutoGame,
};

export default onlineActionCreators;