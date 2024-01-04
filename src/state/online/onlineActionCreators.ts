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
import GameCreationResult from '../../client/contracts/GameCreationResult';
import Sex from '../../model/enums/Sex';
import tableActionCreators from '../table/tableActionCreators';
import roomActionCreators from '../room/roomActionCreators';
import * as GameErrorsHelper from '../../utils/GameErrorsHelper';
import actionCreators from '../actionCreators';
import gameActionCreators from '../game/gameActionCreators';
import ServerTimeSettings from '../../client/contracts/ServerTimeSettings';
import GameCreationResultCode from '../../client/contracts/GameCreationResultCode';
import LobbySideMode from '../../model/enums/LobbySideMode';
import SIStatisticsClient from 'sistatistics-client';
import GamePlatforms from 'sistatistics-client/dist/models/GamePlatforms';

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

	let gamesSlice: Slice<GameInfo> = { Data: [], IsLastSlice: false };
	let whileGuard = 100;
	do {
		const fromId = gamesSlice.Data.length > 0 ? gamesSlice.Data[gamesSlice.Data.length - 1].GameID + 1 : 0;

		gamesSlice = await gameClient.getGamesSliceAsync(fromId);

		dispatch(receiveGames(gamesSlice.Data));

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
	(gameId: number, showInfo?: boolean) => async (dispatch: Dispatch<Action>, getState: () => State, dataContext: DataContext) => {
		const state = getState();
		const requestCulture = getFullCulture(state);

		await dataContext.gameClient.joinLobbyAsync(requestCulture);

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
			await loadStatisticsAsync(dispatch, dataContext);

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

async function loadStatisticsAsync(dispatch: Dispatch<OnlineActions.KnownOnlineAction>, dataContext: DataContext) {
	const siStatisticsClient = new SIStatisticsClient({ serviceUri: dataContext.config.siStatisticsServiceUri });

	const now = new Date();
	const ONE_DAY = 24 * 60 * 60 * 1000;

	const filter = {
		platform: GamePlatforms.GameServer,
		from: new Date(now.getTime() - ONE_DAY),
		to: now,
	};

	const packagesStatistics = await siStatisticsClient.getLatestTopPackagesAsync(filter);
	dispatch({ type: OnlineActions.OnlineActionTypes.PackagesStatisticsLoaded, packagesStatistics });

	const gamesStatistics = await siStatisticsClient.getLatestGamesStatisticAsync(filter);
	dispatch({ type: OnlineActions.OnlineActionTypes.GamesStatisticLoaded, gamesStatistics });

	const latestGames = await siStatisticsClient.getLatestGamesInfoAsync(filter);
	dispatch({ type: OnlineActions.OnlineActionTypes.LatestGamesLoaded, latestGames });
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
		Type: PackageType2.Content,
		Uri: packageUri,
		ContentServiceUri: contentClient.options.serviceUri,
		Secret: null
	};
}

function getRandomValue(): number {
	const array = new Uint32Array(1);
	crypto.getRandomValues(array);

	return array[0];
}

const initGameAsync = async (dispatch: Dispatch<any>, dataContext: DataContext, gameId: number, role: Role, isAutomatic: boolean) => {
	dispatch(gameActionCreators.gameSet(gameId, isAutomatic));
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

		if (result.ErrorMessage) {
			dispatch(joinGameFinished(`${localization.joinError}: ${result.ErrorMessage}`));
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

		const compPlayersCount = playersCount - humanPlayersCount - (role === Role.Player ? 1 : 0);

		const compIndicies = [];

		for (let i = 0; i < state.common.computerAccounts.length; i++) {
			compIndicies.push(i);
		}

		for (let i = 0; i < humanPlayersCount; i++) {
			players.push({ Name: Constants.ANY_NAME, IsHuman: true });
		}

		for (let i = 0; i < compPlayersCount; i++) {
			const ind = Math.floor(Math.random() * compIndicies.length);
			players.push({ Name: state.common.computerAccounts[compIndicies[ind]], IsHuman: false });
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

		let result: GameCreationResult;

		try {
			if (game.package.type === PackageType.File && game.package.data) {
				const packageInfo = await uploadPackageAsync2(dataContext.contentClient, game.package.data, dispatch);

				result = await dataContext.gameClient.createAndJoinGame2Async(
					gameSettings,
					packageInfo,
					state.settings.sex === Sex.Male
				);
			} else if (game.package.type === PackageType.SIStorage && game.package.uri) {
				const packageInfo: PackageInfo = {
					Type: PackageType2.LibraryItem,
					Uri: game.package.uri,
					ContentServiceUri: null,
					Secret: null
				};

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
								Name: '',
								Hash: null,
								Id: null
							};

						case PackageType.File:
							return null;

						case PackageType.SIStorage:
							return null;

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

			if (result.Code !== GameCreationResultCode.Ok) {
				dispatch(gameCreationEnd(GameErrorsHelper.getMessage(result.Code) + (result.ErrorMessage || '')));
			} else {
				dispatch(newGameCancel());
				await initGameAsync(dispatch, dataContext, result.GameId, role, false);
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

			if (result.Code !== GameCreationResultCode.Ok) {
				alert(GameErrorsHelper.getMessage(result.Code) + (result.ErrorMessage || ''));
			} else {
				await initGameAsync(dispatch, dataContext, result.GameId, Role.Player, true);
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