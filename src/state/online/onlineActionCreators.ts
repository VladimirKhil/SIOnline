import { Action, ActionCreator, Dispatch } from 'redux';
import State from '../State';
import DataContext from '../../model/DataContext';
import getErrorMessage from '../../utils/ErrorHelpers';
import localization from '../../model/resources/localization';
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
import Path from '../../model/enums/Path';
import ServerSex from '../../client/contracts/ServerSex';
import IGameClient from '../../client/game/IGameClient';
import ServerRole from '../../client/contracts/ServerRole';
import { userErrorChanged } from '../commonSlice';
import WellKnownSIContentServiceErrorCode from 'sicontent-client/dist/models/WellKnownSIContentServiceErrorCode';
import RandomPackageParameters from 'sistorage-client/dist/models/RandomPackageParameters';
import { AppDispatch } from '../store';
import { showWelcome, tableReset } from '../tableSlice';
import { ContextView, nameChanged, setContext, setIsGameStarted, setRoomRole } from '../room2Slice';
import { GameState, PackageData, setGameSet } from '../gameSlice';
import { saveStateToStorage } from '../StateHelpers';
import { INavigationState } from '../uiSlice';
import { navigate } from '../../utils/Navigator';
import { UnknownAction } from '@reduxjs/toolkit';
import { downloadPackageFinished,
	downloadPackageStarted,
	gameCreationEnd,
	gameCreationStart,
	joinGameFinished,
	joinGameStarted,
	newGameCancel,
	passwordChanged,
	uploadPackageFinished,
	uploadPackageProgress,
	uploadPackageStarted } from '../online2Slice';

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
			type: PackageType2.Content,
			uri: packageUri,
			contentServiceUri: contentClient.options.serviceUri,
			secret: null,
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
	appDispatch(showWelcome());
	appDispatch(setContext(ContextView.None));
	// TODO: provide single action to reset room state
	appDispatch(nameChanged(name));
	appDispatch(setRoomRole(role));
	dispatch(roomActionCreators.stopTimer(0));
	dispatch(roomActionCreators.stopTimer(1));
	dispatch(roomActionCreators.stopTimer(2));
	dispatch(roomActionCreators.onKicked(false));
	appDispatch(setIsGameStarted(false));
	dispatch(roomActionCreators.afterQuestionStateChanged(false));
	dispatch(roomActionCreators.isQuestionChanged(false, ''));
	dispatch(roomActionCreators.areSumsEditableChanged(false));

	await gameClient.info();
	await gameClient.moveable();

	if (role === Role.Player || role === Role.Showman) {
		await gameClient.ready(true);
	}
};

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
	appDispatch(joinGameStarted());

	try {
		const siHostClient = await actionCreators.connectToSIHostAsync(hostUri, dispatch, appDispatch, getState, dataContext);

		const state = getState();
		const serverRole = getServerRole(role);

		const result = await siHostClient.joinGameAsync({
			GameId: gameId,
			UserName: userName,
			Role: serverRole,
			Sex: state.settings.sex === Sex.Male ? ServerSex.Male : ServerSex.Female,
			Password: state.online2.password,
			Pin: pin,
		});

		if (!result.IsSuccess) {
			appDispatch(userErrorChanged(
				`${localization.joinError}: ${GameErrorsHelper.getJoinErrorMessage(result.ErrorType)} ${result.Message ?? ''}`));

			return;
		}

		await initGameAsync(dispatch, appDispatch, dataContext.game, gameId, userName, role, false);
		saveStateToStorage(getState()); // use state that could be changed by initGameAsync

		const navigation: INavigationState = {
			path: Path.Room,
			hostUri: hostUri,
			gameId: gameId,
			role: role,
			sex: state.settings.sex,
			password: state.online2.password,
			isAutomatic: false,
		};

		appDispatch(navigate({ navigation, saveState: true }));
	} catch (error) {
		appDispatch(userErrorChanged(getErrorMessage(error)));
	} finally {
		appDispatch(joinGameFinished());
		appDispatch(newGameCancel());
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

	appDispatch(joinGame(gameInfo.hostUri, gameInfo.gameId, userName, role, pin, appDispatch) as unknown as UnknownAction);
};

function createGameSettings(
	playersCount: number,
	role: Role,
	state: State,
	players: AccountSettings[],
	game: GameState,
	isSingleGame: boolean,
	showman: AccountSettings,
	viewers: AccountSettings[],
	computerAccounts: string[],
) {
	const otherPlayerCount = playersCount - (role === Role.Player ? 1 : 0);
	const humanPlayerCount = isSingleGame ? 0 : otherPlayerCount;
	const compPlayersCount = otherPlayerCount - humanPlayerCount;

	const compIndicies = [];

	for (let i = 0; i < computerAccounts.length; i++) {
		compIndicies.push(i);
	}

	for (let i = 0; i < humanPlayerCount; i++) {
		players.push({ name: Constants.ANY_NAME, isHuman: true });
	}

	for (let i = 0; i < compPlayersCount; i++) {
		const ind = Math.floor(Math.random() * compIndicies.length);
		players.push({ name: computerAccounts[compIndicies[ind]], isHuman: false });
		compIndicies.splice(ind, 1);
	}

	const gameMode = game.type;

	const ts = state.settings.appSettings.timeSettings;

	const timeSettings: ServerTimeSettings = {
		timeForChoosingQuestion: ts.timeForChoosingQuestion,
		timeForThinkingOnQuestion: ts.timeForThinkingOnQuestion,
		timeForPrintingAnswer: ts.timeForPrintingAnswer,
		timeForGivingACat: ts.timeForGivingACat,
		timeForMakingStake: ts.timeForMakingStake,
		timeForThinkingOnSpecial: ts.timeForThinkingOnSpecial,
		timeOfRound: ts.timeOfRound,
		timeForChoosingFinalTheme: ts.timeForChoosingFinalTheme,
		timeForFinalThinking: ts.timeForFinalThinking,
		timeForShowmanDecisions: ts.timeForShowmanDecisions,
		timeForRightAnswer: ts.timeForRightAnswer,
		timeForMediaDelay: 0,
		timeForBlockingButton: ts.timeForBlockingButton,
		partialImageTime: ts.partialImageTime,
		imageTime: ts.imageTime,
	};

	const appSettings: ServerAppSettings = {
		timeSettings: timeSettings,
		readingSpeed: state.settings.appSettings.readingSpeed,
		falseStart: state.settings.appSettings.falseStart,
		hintShowman: state.settings.appSettings.hintShowman,
		oral: state.settings.appSettings.oral,
		oralPlayersActions: state.settings.appSettings.oralPlayersActions,
		ignoreWrong: state.settings.appSettings.ignoreWrong,
		managed: state.settings.appSettings.managed,
		gameMode: gameMode,
		partialText: state.settings.appSettings.partialText,
		partialImages: state.settings.appSettings.partialImages,
		playAllQuestionsInFinalRound: state.settings.appSettings.playAllQuestionsInFinalRound,
		allowEveryoneToPlayHiddenStakes: state.settings.appSettings.allowEveryoneToPlayHiddenStakes,
		displaySources: state.settings.appSettings.displaySources,
		randomQuestionsBasePrice: gameMode === GameType.Simple ? 10 : 100,
		randomRoundsCount: gameMode === GameType.Simple ? 1 : 3,
		randomThemesCount: gameMode === GameType.Simple ? 5 : 6,
		culture: getFullCulture(state),
		buttonPressMode: state.settings.appSettings.buttonPressMode,
		preloadRoundContent: state.settings.appSettings.preloadRoundContent,
		useApellations: state.settings.appSettings.useApellations,
		displayAnswerOptionsOneByOne: state.settings.appSettings.displayAnswerOptionsOneByOne,
		displayAnswerOptionsLabels: state.settings.appSettings.displayAnswerOptionsLabels,
	};

	const gameSettings: GameSettings = {
		humanPlayerName: state.user.login,
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

	return gameSettings;
}

function selectContentClientBySharding(contentClients: SIContentClient[], packageInfo: PackageData): SIContentClient {
	if (contentClients.length === 0) {
		throw new Error('No content clients available');
	}

	if (contentClients.length === 1) {
		return contentClients[0]; // Only one client available, no need for sharding
	}

	// Create a deterministic identifier for the package
	// using available package data to ensure consistent sharding
	const packageIdentifier = packageInfo.data?.name ?? packageInfo.name;

	// Create a simple hash from the packageIdentifier
	let hash = 0;

	for (let i = 0; i < packageIdentifier.length; i++) {
		// Simple hash function: multiply by 31 and add character code
		hash = ((hash << 5) - hash) + packageIdentifier.charCodeAt(i);
		hash |= 0; // Convert to 32-bit integer
	}

	// Use the absolute value of the hash to select a client
	const clientIndex = Math.abs(hash) % contentClients.length;
	return contentClients[clientIndex];
}

async function getPackageInfoAsync(state: State, game: GameState, dataContext: DataContext, dispatch: AppDispatch): Promise<PackageInfo> {
	switch (game.package.type) {
		case PackageType.File:
			if (!game.package.data) {
				throw new Error('Package data not found');
			}

			const contentClient = selectContentClientBySharding(dataContext.contentClients, game.package);
			const packageInfo = await uploadPackageAsync2(contentClient, game.package.data, dispatch);
			return packageInfo;

		case PackageType.SIStorage:
			if (!game.package.uri) {
				throw new Error('Package uri not found');
			}

			return {
				type: PackageType2.LibraryItem,
				uri: game.package.uri,
				contentServiceUri: null,
				secret: null,
			};

		case PackageType.HostManaged: {
			if (!game.package.id) {
				throw new Error('Package id not found');
			}

			dispatch(downloadPackageStarted());

			let packageData: File | null = null;

			try {
				packageData = await dataContext.host.getPackageData(game.package.id);
			} finally {
				dispatch(downloadPackageFinished());
			}

			if (!packageData) {
				throw new Error('Package data not found');
			}

			const contentClient = selectContentClientBySharding(dataContext.contentClients, game.package);
			const packageInfo2 = await uploadPackageAsync2(contentClient, packageData, dispatch);
			return packageInfo2;
		}

		default:
			if (dataContext.storageClients.length === 0) {
				throw new Error('Storage client not found');
			}

			const storageClient = dataContext.storageClients[0];

			const languages = await storageClient.facets.getLanguagesAsync();
			const currentLanguage = getFullCulture(state);
			const language = languages.find(l => l.code === currentLanguage);

			const randomPackageParameters: RandomPackageParameters = {
				restrictionIds: [-1],
				tagIds: [-1],
				roundCount: 2,
				tableThemeCount: 6,
				themeListThemeCount: 4,
				baseQuestionPrice: 100,
			};

			if (language) {
				randomPackageParameters.languageId = language.id;
			}

			const randomPackage = await storageClient.packages.getRandomPackageAsync(randomPackageParameters);

			if (!randomPackage || !randomPackage.directContentUri) {
				throw new Error('Random package creation error');
			}

			return {
				type: PackageType2.LibraryItem,
				uri: randomPackage.directContentUri,
				contentServiceUri: null,
				secret: null,
			};
	}
}

const createNewGame: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	(isSingleGame: boolean, appDispatch: AppDispatch) => async (dispatch: Dispatch<any>, getState: () => State, dataContext: DataContext) => {
		const state = getState();

		if (state.online2.gameCreationProgress || state.online2.joinGameProgress) {
			return;
		}

		if (!isSingleGame && state.game.name.length === 0) {
			appDispatch(userErrorChanged(localization.gameNameMustBeSpecified));
			return;
		}

		if (state.common.computerAccounts === null) {
			appDispatch(userErrorChanged(localization.computerAccountsMissing));
			return;
		}

		appDispatch(gameCreationStart());

		try {
			const game = isSingleGame
				? {
					...state.game,
					name: getRandomValue().toString(),
					password: getRandomValue().toString(), // protecting from anyone to join
					isShowmanHuman: false,
					humanPlayersCount: 0
				} : state.game;

			const { playersCount, role } = game;
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

			const gameSettings = createGameSettings(
				playersCount,
				role,
				state,
				players,
				game,
				isSingleGame,
				showman,
				viewers,
				state.common.computerAccounts,
			);

			const packageInfo = await getPackageInfoAsync(state, game, dataContext, dispatch);

			const result = await dataContext.gameClient.runGameAsync({
				gameSettings: gameSettings,
				packageInfo: packageInfo,
				computerAccounts: []
			});

			saveStateToStorage(state);

			if (!result.isSuccess) {
				appDispatch(userErrorChanged(GameErrorsHelper.getMessage(result.errorType)));
			} else {
				appDispatch(passwordChanged(gameSettings.networkGamePassword));
				dispatch(joinGame(result.hostUri, result.gameId, state.user.login, role, null, appDispatch));
			}
		} catch (error) {
			const userError = getErrorMessage(error);
			appDispatch(userErrorChanged(userError));
		} finally {
			appDispatch(gameCreationEnd());
		}
	};

const createNewAutoGame: ActionCreator<ThunkAction<void, State, DataContext, Action>> =
	(appDispatch: AppDispatch) => async (dispatch: Dispatch<any>, getState: () => State, dataContext: DataContext) => {
		const state = getState();

		if (state.online2.gameCreationProgress || state.online2.joinGameProgress) {
			return;
		}

		appDispatch(gameCreationStart());

		try {
			const result = await dataContext.gameClient.runAutoGameAsync({
				culture: getFullCulture(state),
			});

			saveStateToStorage(state);

			if (!result.isSuccess) {
				appDispatch(userErrorChanged(GameErrorsHelper.getMessage(result.errorType)));
			} else {
				dispatch(joinGame(result.hostUri, result.gameId, state.user.login, Role.Player, null, appDispatch));
			}
		} catch (error) {
			appDispatch(userErrorChanged(getErrorMessage(error)));
		} finally {
			appDispatch(gameCreationEnd());
		}
	};

const onlineActionCreators = {
	joinGame,
	joinByPin,
	createNewGame,
	createNewAutoGame,
	initGameAsync,
};

export default onlineActionCreators;