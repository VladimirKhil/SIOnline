import { Action, ActionCreator, Dispatch } from 'redux';
import * as OnlineActions from './OnlineActions';
import IGameServerClient from '../../client/IGameServerClient';
import Slice from '../../client/contracts/Slice';
import GameInfo from '../../client/contracts/GameInfo';
import State from '../State';
import DataContext from '../../model/DataContext';
import getErrorMessage from '../../utils/ErrorHelpers';
import localization from '../../model/resources/localization';
import GamesFilter from '../../model/enums/GamesFilter';
import SIContentClient, { SIContentServiceError } from 'sicontent-client';
import PackageInfo from '../../client/contracts/PackageInfo';
import { ThunkAction } from 'redux-thunk';
import AccountSettings from '../../client/contracts/AccountSettings';
import Role from '../../model/Role';
import Constants from '../../model/enums/Constants';
import ServerAppSettings from '../../client/contracts/ServerAppSettings';
import GameType from '../../model/GameType';
import { getFullCulture } from '../../utils/StateHelpers';
import GameSettings from '../../client/contracts/GameSettings';
import PackageType from '../../model/enums/PackageType';
import PackageType2 from '../../client/contracts/PackageType';
import Sex from '../../model/enums/Sex';
import roomActionCreators from '../room/roomActionCreators';
import * as GameErrorsHelper from '../../utils/GameErrorsHelper';
import actionCreators from '../../logic/actionCreators';
import ServerTimeSettings from '../../client/contracts/ServerTimeSettings';
import LobbySideMode from '../../model/enums/LobbySideMode';
import SIStatisticsClient from 'sistatistics-client';
import GamePlatforms from 'sistatistics-client/dist/models/GamePlatforms';
import StatisticFilter from 'sistatistics-client/dist/models/StatisticFilter';
import Path from '../../model/enums/Path';
import ServerSex from '../../client/contracts/ServerSex';
import IGameClient from '../../client/game/IGameClient';
import ServerRole from '../../client/contracts/ServerRole';
import clearUrls from '../../utils/clearUrls';
import { userErrorChanged, userWarnChanged } from '../new/commonSlice';
import WellKnownSIContentServiceErrorCode from 'sicontent-client/dist/models/WellKnownSIContentServiceErrorCode';
import RandomPackageParameters from 'sistorage-client/dist/models/RandomPackageParameters';
import { AppDispatch } from '../new/store';
import { showText, tableReset } from '../new/tableSlice';
import { ContextView, setContext } from '../new/room2Slice';
import { GameState, setGameSet } from '../new/gameSlice';
import { saveStateToStorage } from '../new/StateHelpers';
import { INavigationState } from '../new/uiSlice';
import { navigate } from '../../utils/Navigator';
import { UnknownAction } from '@reduxjs/toolkit';
import { uploadPackageFinished, uploadPackageProgress, uploadPackageStarted } from '../new/online2Slice';

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

async function loadGamesAsync(dispatch: Dispatch<OnlineActions.KnownOnlineAction>, gameClient: IGameServerClient, clear: boolean | undefined) {
	dispatch(clearGames());

	let gamesSlice: Slice<GameInfo> = { Data: [], IsLastSlice: false };
	let whileGuard = 100;
	do {
		const fromId = gamesSlice.Data.length > 0 ? gamesSlice.Data[gamesSlice.Data.length - 1].GameID + 1 : 0;

		gamesSlice = await gameClient.getGamesSliceAsync(fromId);

		dispatch(receiveGames(clear ? gamesSlice.Data.map(d => ({ ...d, PackageName: clearUrls(d.PackageName) })) : gamesSlice.Data));

		whileGuard--;
	} while (!gamesSlice.IsLastSlice && whileGuard > 0);
}

const onlineLoadFinish: ActionCreator<OnlineActions.OnlineLoadFinishedAction> = () => ({
	type: OnlineActions.OnlineActionTypes.OnlineLoadFinished
});

const onlineLoadError: ActionCreator<OnlineActions.OnlineLoadErrorAction> = (error: string) => ({
	type: OnlineActions.OnlineActionTypes.OnlineLoadError,
	error
});

const receiveGameStart: ActionCreator<OnlineActions.ReceiveGamesStartAction> = () => ({
	type: OnlineActions.OnlineActionTypes.ReceiveGamesStart
});

const resetLobby: ActionCreator<OnlineActions.ResetLobbyAction> = () => ({
	type: OnlineActions.OnlineActionTypes.ResetLobby
});

const navigateToLobby: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	(appDispatch: AppDispatch) => async (
		dispatch: Dispatch<Action>,
		getState: () => State,
		dataContext: DataContext) => {
		const state = getState();
		const requestCulture = getFullCulture(state);

		await dataContext.gameClient.joinLobbyAsync(requestCulture);
		dispatch(resetLobby());

		// Games filtering is performed on client
		try {
			await loadGamesAsync(dispatch, dataContext.gameClient, dataContext.config.clearUrls);

			try {
				await loadStatisticsAsync(dispatch, dataContext);
			} catch (error) {
				appDispatch(userWarnChanged(getErrorMessage(error)));
			}

			dispatch(onlineLoadFinish());
		} catch (error) {
			dispatch(onlineLoadError(getErrorMessage(error)));
		}
	};

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

const chatModeChanged: ActionCreator<OnlineActions.ChatModeChangedAction> = (chatMode: LobbySideMode) => ({
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

const gameCreationStart: ActionCreator<OnlineActions.GameCreationStartAction> = () => ({
	type: OnlineActions.OnlineActionTypes.GameCreationStart
});

const gameCreationEnd: ActionCreator<OnlineActions.GameCreationEndAction> = (error: string | null = null) => ({
	type: OnlineActions.OnlineActionTypes.GameCreationEnd,
	error
});

async function loadStatisticsAsync(dispatch: Dispatch<OnlineActions.KnownOnlineAction>, dataContext: DataContext) {
	const siStatisticsClient = new SIStatisticsClient({ serviceUri: dataContext.config.siStatisticsServiceUri });

	const now = new Date();
	const ONE_DAY = 24 * 60 * 60 * 1000;

	const filter: StatisticFilter = {
		platform: GamePlatforms.GameServer,
		from: new Date(now.getTime() - ONE_DAY),
		to: now,
		count: 5,
		languageCode: localization.getLanguage()
	};

	const packagesStatistics = await siStatisticsClient.getLatestTopPackagesAsync({ ...filter, count: 6 });
	dispatch({ type: OnlineActions.OnlineActionTypes.PackagesStatisticsLoaded, packagesStatistics });

	const gamesStatistics = await siStatisticsClient.getLatestGamesStatisticAsync(filter);
	dispatch({ type: OnlineActions.OnlineActionTypes.GamesStatisticLoaded, gamesStatistics });

	const latestGames = await siStatisticsClient.getLatestGamesInfoAsync({ ...filter, count: 25 });
	dispatch({ type: OnlineActions.OnlineActionTypes.LatestGamesLoaded, latestGames });
}

async function uploadPackageAsync2(
	contentClient: SIContentClient,
	packageData: File,
	dispatch: AppDispatch,
): Promise<PackageInfo> {
	try {
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
			Type: PackageType2.Content,
			Uri: packageUri,
			ContentServiceUri: contentClient.options.serviceUri,
			Secret: null
		};
	} catch (error) {
		switch ((error as SIContentServiceError)?.errorCode) {
			case WellKnownSIContentServiceErrorCode.BadPackageFile:
				throw new Error(localization.badPackage);

			case WellKnownSIContentServiceErrorCode.FileTooLarge:
				throw new Error(localization.packageIsTooBig);

			default:
				throw error;
		}
	}
}

function getRandomValue(): number {
	const array = new Uint32Array(1);
	crypto.getRandomValues(array);

	return array[0];
}

const initGameAsync = async (
	dispatch: Dispatch<any>,
	appDispatch: AppDispatch,
	gameClient: IGameClient,
	gameId: number,
	name: string,
	role: Role,
	isAutomatic: boolean,
) => {
	appDispatch(setGameSet({ id: gameId, isAutomatic }));
	appDispatch(tableReset());
	appDispatch(showText(localization.tableHint));
	appDispatch(setContext(ContextView.None));
	// TODO: provide single action to reset room state
	dispatch(roomActionCreators.nameChanged(name));
	dispatch(roomActionCreators.roleChanged(role));
	dispatch(roomActionCreators.stopTimer(0));
	dispatch(roomActionCreators.stopTimer(1));
	dispatch(roomActionCreators.stopTimer(2));
	dispatch(roomActionCreators.gameStarted(false));
	dispatch(roomActionCreators.afterQuestionStateChanged(false));
	dispatch(roomActionCreators.isQuestionChanged(false, ''));
	dispatch(roomActionCreators.areSumsEditableChanged(false));

	await gameInit(gameClient, role);
};

const joinGameStarted: ActionCreator<OnlineActions.JoinGameStartedAction> = () => ({
	type: OnlineActions.OnlineActionTypes.JoinGameStarted
});

const joinGameFinished: ActionCreator<OnlineActions.JoinGameFinishedAction> = () => ({
	type: OnlineActions.OnlineActionTypes.JoinGameFinished,
});

function getServerRole(role: Role) {
	if (role === Role.Viewer) {
		return ServerRole.Viewer;
	}

	return role === Role.Player ? ServerRole.Player : ServerRole.Showman;
}

const joinGame: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	(hostUri: string, gameId: number, userName: string, role: Role, pin: number | null, appDispatch: AppDispatch) => async (
	dispatch: Dispatch<any>,
	getState: () => State,
	dataContext: DataContext
) => {
	dispatch(joinGameStarted());

	try {
		const siHostClient = await actionCreators.connectToSIHostAsync(hostUri, dispatch, appDispatch, getState, dataContext);

		const state = getState();
		const serverRole = getServerRole(role);

		const result = await siHostClient.joinGameAsync({
			GameId: gameId,
			UserName: userName,
			Role: serverRole,
			Sex: state.settings.sex === Sex.Male ? ServerSex.Male : ServerSex.Female,
			Password: state.online.password,
			Pin: pin,
		});

		if (!result.IsSuccess) {
			appDispatch(userErrorChanged(
				`${localization.joinError}: ${GameErrorsHelper.getJoinErrorMessage(result.ErrorType)} ${result.Message ?? ''}`));

			return;
		}

		await initGameAsync(dispatch, appDispatch, dataContext.game, gameId, userName, role, false);
		await actionCreators.disconnectAsync(appDispatch, dataContext);
		saveStateToStorage(getState()); // use state that could be changed by initGameAsync

		const navigation: INavigationState = {
			path: Path.Room,
			hostUri: hostUri,
			gameId: gameId,
			role: role,
			sex: state.settings.sex,
			password: state.online.password,
			isAutomatic: false,
		};

		appDispatch(navigate({ navigation, saveState: true }));
	} catch (error) {
		appDispatch(userErrorChanged(getErrorMessage(error)));
	} finally {
		dispatch(joinGameFinished());
		dispatch(newGameCancel());
	}
};

const joinByPin: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
(pin: number, userName: string, role: Role, appDispatch: AppDispatch) => async (
	dispatch: Dispatch<any>,
	getState: () => State,
	dataContext: DataContext,
) => {
	const gameInfo = await dataContext.gameClient.getGameByPinAsync(pin);

	if (!gameInfo) {
		appDispatch(userErrorChanged(localization.gameNotFound));
		return;
	}

	appDispatch(joinGame(gameInfo.HostUri, gameInfo.GameId, userName, role, pin, appDispatch) as unknown as UnknownAction);
};

function createGameSettings(
	playersCount: number,
	humanPlayersCount: number,
	role: Role,
	state: State,
	players: AccountSettings[],
	game: GameState,
	isSingleGame: boolean,
	showman: AccountSettings,
	viewers: AccountSettings[],
	computerAccounts: string[],
) {
	const compPlayersCount = playersCount - humanPlayersCount - (role === Role.Player ? 1 : 0);

	const compIndicies = [];

	for (let i = 0; i < computerAccounts.length; i++) {
		compIndicies.push(i);
	}

	for (let i = 0; i < humanPlayersCount; i++) {
		players.push({ Name: Constants.ANY_NAME, IsHuman: true });
	}

	for (let i = 0; i < compPlayersCount; i++) {
		const ind = Math.floor(Math.random() * compIndicies.length);
		players.push({ Name: computerAccounts[compIndicies[ind]], IsHuman: false });
		compIndicies.splice(ind, 1);
	}

	const gameMode = game.type;

	const ts = state.settings.appSettings.timeSettings;

	const timeSettings: ServerTimeSettings = {
		TimeForChoosingQuestion: ts.timeForChoosingQuestion,
		TimeForThinkingOnQuestion: ts.timeForThinkingOnQuestion,
		TimeForPrintingAnswer: ts.timeForPrintingAnswer,
		TimeForGivingACat: ts.timeForGivingACat,
		TimeForMakingStake: ts.timeForMakingStake,
		TimeForThinkingOnSpecial: ts.timeForThinkingOnSpecial,
		TimeOfRound: ts.timeOfRound,
		TimeForChoosingFinalTheme: ts.timeForChoosingFinalTheme,
		TimeForFinalThinking: ts.timeForFinalThinking,
		TimeForShowmanDecisions: ts.timeForShowmanDecisions,
		TimeForRightAnswer: ts.timeForRightAnswer,
		TimeForMediaDelay: ts.timeForMediaDelay,
		TimeForBlockingButton: ts.timeForBlockingButton,
		PartialImageTime: ts.partialImageTime,
	};

	const appSettings: ServerAppSettings = {
		TimeSettings: timeSettings,
		ReadingSpeed: state.settings.appSettings.readingSpeed,
		FalseStart: state.settings.appSettings.falseStart,
		HintShowman: state.settings.appSettings.hintShowman,
		Oral: state.settings.appSettings.oral,
		OralPlayersActions: state.settings.appSettings.oralPlayersActions,
		IgnoreWrong: state.settings.appSettings.ignoreWrong,
		Managed: state.settings.appSettings.managed,
		GameMode: gameMode.toString(),
		PartialText: state.settings.appSettings.partialText,
		PartialImages: state.settings.appSettings.partialImages,
		PlayAllQuestionsInFinalRound: state.settings.appSettings.playAllQuestionsInFinalRound,
		AllowEveryoneToPlayHiddenStakes: state.settings.appSettings.allowEveryoneToPlayHiddenStakes,
		DisplaySources: state.settings.appSettings.displaySources,
		RandomQuestionsBasePrice: gameMode === GameType.Simple ? 10 : 100,
		RandomRoundsCount: gameMode === GameType.Simple ? 1 : 3,
		RandomThemesCount: gameMode === GameType.Simple ? 5 : 6,
		Culture: getFullCulture(state),
		UsePingPenalty: state.settings.appSettings.usePingPenalty,
		ButtonPressMode: state.settings.appSettings.buttonPressMode.toString(),
		PreloadRoundContent: state.settings.appSettings.preloadRoundContent,
		UseApellations: state.settings.appSettings.useApellations,
		DisplayAnswerOptionsOneByOne: state.settings.appSettings.displayAnswerOptionsOneByOne,
		DisplayAnswerOptionsLabels: state.settings.appSettings.displayAnswerOptionsLabels,
	};

	const gameSettings: GameSettings = {
		HumanPlayerName: state.user.login,
		RandomSpecials: game.package.type === PackageType.Random,
		NetworkGameName: game.name.trim(),
		NetworkGamePassword: game.password,
		NetworkVoiceChat: game.voiceChat,
		IsPrivate: isSingleGame,
		AllowViewers: true,
		Showman: showman,
		Players: players,
		Viewers: viewers,
		AppSettings: appSettings
	};

	return gameSettings;
}

async function getPackageInfoAsync(state: State, game: GameState, dataContext: DataContext, dispatch: AppDispatch): Promise<PackageInfo> {
	switch (game.package.type) {
		case PackageType.File:
			if (!game.package.data) {
				throw new Error('Package data not found');
			}

			const packageInfo = await uploadPackageAsync2(dataContext.contentClient, game.package.data, dispatch);
			return packageInfo;

		case PackageType.SIStorage:
			if (!game.package.uri) {
				throw new Error('Package uri not found');
			}

			return {
				Type: PackageType2.LibraryItem,
				Uri: game.package.uri,
				ContentServiceUri: null,
				Secret: null
			};

		default:
			if (!dataContext.storageClient) {
				throw new Error('Storage client not found');
			}

			const languages = await dataContext.storageClient.facets.getLanguagesAsync();
			const currentLanguage = getFullCulture(state);
			const language = languages.find(l => l.code === currentLanguage);

			const randomPackageParameters: RandomPackageParameters = { restrictionIds: [-1], tagIds: [-1] };

			if (language) {
				randomPackageParameters.languageId = language.id;
			}

			const randomPackage = await dataContext.storageClient?.packages.getRandomPackageAsync(randomPackageParameters);

			if (!randomPackage || !randomPackage.directContentUri) {
				throw new Error('Random package creation error');
			}

			return {
				Type: PackageType2.LibraryItem,
				Uri: randomPackage.directContentUri,
				ContentServiceUri: null,
				Secret: null
			};
	}
}

const createNewGame: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	(isSingleGame: boolean, appDispatch: AppDispatch) => async (dispatch: Dispatch<any>, getState: () => State, dataContext: DataContext) => {
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
		const me: AccountSettings = { Name: state.user.login, IsHuman: true, IsMale: state.settings.sex === Sex.Male };

		const showman: AccountSettings = role === Role.Showman
			? me
			: game.isShowmanHuman
				? { Name: Constants.ANY_NAME, IsHuman: true }
				: { Name: localization.defaultShowman };

		const players: AccountSettings[] = [];
		const viewers: AccountSettings[] = [];

		if (role === Role.Viewer) {
			viewers.push(me);
		} else if (role === Role.Player) {
			players.push(me);
		}

		const gameSettings = createGameSettings(
			playersCount,
			humanPlayersCount,
			role,
			state,
			players,
			game,
			isSingleGame,
			showman,
			viewers,
			state.common.computerAccounts,
		);

		try {
			const packageInfo = await getPackageInfoAsync(state, game, dataContext, dispatch);

			const result = await dataContext.gameClient.runGameAsync({
				GameSettings: gameSettings,
				PackageInfo: packageInfo,
				ComputerAccounts: []
			});

			saveStateToStorage(state);

			if (!result.IsSuccess) {
				appDispatch(userErrorChanged(GameErrorsHelper.getMessage(result.ErrorType)));
			} else {
				dispatch(passwordChanged(gameSettings.NetworkGamePassword));
				dispatch(joinGame(result.HostUri, result.GameId, state.user.login, role, null, appDispatch));
			}
		} catch (error) {
			const userError = getErrorMessage(error);
			appDispatch(userErrorChanged(userError));
		} finally {
			dispatch(gameCreationEnd());
		}
	};

const createNewAutoGame: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	(appDispatch: AppDispatch) => async (dispatch: Dispatch<any>, getState: () => State, dataContext: DataContext) => {
		const state = getState();

		dispatch(gameCreationStart());

		try {
			const result = await dataContext.gameClient.runAutoGameAsync({
				Culture: getFullCulture(state)
			});

			saveStateToStorage(state);

			if (!result.IsSuccess) {
				appDispatch(userErrorChanged(GameErrorsHelper.getMessage(result.ErrorType)));
			} else {
				dispatch(joinGame(result.HostUri, result.GameId, state.user.login, Role.Player, null, appDispatch));
			}
		} catch (error) {
			appDispatch(userErrorChanged(getErrorMessage(error)));
		} finally {
			dispatch(gameCreationEnd());
		}
	};

async function gameInit(gameClient: IGameClient, role: Role) {
	await gameClient.info();
	await gameClient.moveable();

	if (role === Role.Player || role === Role.Showman) {
		await gameClient.ready();
	}
}

const onlineActionCreators = {
	receiveGameStart,
	navigateToLobby,
	onGamesFilterToggle,
	onGamesSearchChanged,
	selectGame,
	unselectGame,
	newGame,
	newGameCancel,
	joinGame,
	joinByPin,
	passwordChanged,
	chatModeChanged,
	gameCreated,
	gameChanged,
	gameDeleted,
	createNewGame,
	createNewAutoGame,
	initGameAsync,
};

export default onlineActionCreators;