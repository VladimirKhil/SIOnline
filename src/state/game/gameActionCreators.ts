import { Action, ActionCreator, AnyAction, Dispatch } from 'redux';
import * as GameActions from './GameActions';
import State from '../State';
import DataContext from '../../model/DataContext';
import localization from '../../model/resources/localization';
import Role from '../../model/Role';
import GameType from '../../model/GameType';
import PackageType from '../../model/enums/PackageType';
import { ThunkAction } from 'redux-thunk';

const gameSet: ActionCreator<GameActions.GameSetAction> = (id: number, isAutomatic: boolean) => ({
	type: GameActions.GameActionTypes.GameSet,
	id,
	isAutomatic,
});

const gameNameChanged: ActionCreator<GameActions.GameNameChangedAction> = (gameName: string) => ({
	type: GameActions.GameActionTypes.GameNameChanged,
	gameName
});

const gamePasswordChanged: ActionCreator<GameActions.GamePasswordChangedAction> = (gamePassword: string) => ({
	type: GameActions.GameActionTypes.GamePasswordChanged,
	gamePassword
});

const gameVoiceChatChanged: ActionCreator<GameActions.GameVoiceChatChangedAction> = (gameVoiceChat: string) => ({
	type: GameActions.GameActionTypes.GameVoiceChatChanged,
	gameVoiceChat
});

const gamePackageTypeChanged: ActionCreator<GameActions.GamePackageTypeChangedAction> = (packageType: PackageType) => ({
	type: GameActions.GameActionTypes.GamePackageTypeChanged,
	packageType
});

const gamePackageDataChanged: ActionCreator<GameActions.GamePackageDataChangedAction> = (
	packageName: string,
	packageData: File | null
) => ({
	type: GameActions.GameActionTypes.GamePackageDataChanged,
	packageName,
	packageData
});

const gamePackageDataChangedRequest: ActionCreator<ThunkAction<void, State, DataContext, Action>> = (
	packageName: string,
	packageData: File | null) => (dispatch: Dispatch<AnyAction>, getState: () => State, dataContext: DataContext) => {
		const state = getState();
		const { maxPackageSizeMb } = state.common;

		if (packageData && packageData.size > maxPackageSizeMb * 1024 * 1024) {
			alert(`${localization.packageIsTooBig} (${maxPackageSizeMb} MB)`);
			return;
		}

		dispatch(gamePackageDataChanged(packageName, packageData));
	};

const gamePackageLibraryChanged: ActionCreator<GameActions.GamePackageLibraryChangedAction> = (
	id: string,
	name: string,
	uri: string
) => ({
	type: GameActions.GameActionTypes.GamePackageLibraryChanged,
	id,
	name,
	uri,
});

const gameTypeChanged: ActionCreator<GameActions.GameTypeChangedAction> = (gameType: GameType) => ({
	type: GameActions.GameActionTypes.GameTypeChanged,
	gameType
});

const gameRoleChanged: ActionCreator<GameActions.GameRoleChangedAction> = (gameRole: Role) => ({
	type: GameActions.GameActionTypes.GameRoleChanged,
	gameRole
});

const showmanTypeChanged: ActionCreator<GameActions.ShowmanTypeChangedAction> = (isHuman: boolean) => ({
	type: GameActions.GameActionTypes.ShowmanTypeChanged,
	isHuman
});

const playersCountChanged: ActionCreator<GameActions.PlayersCountChangedAction> = (playersCount: number) => ({
	type: GameActions.GameActionTypes.PlayersCountChanged,
	playersCount
});

const humanPlayersCountChanged: ActionCreator<GameActions.HumanPlayersCountChangedAction> = (
	humanPlayersCount: number
) => ({
	type: GameActions.GameActionTypes.HumanPlayersCountChanged,
	humanPlayersCount
});

const newGame2: ActionCreator<GameActions.NewGame2Action> = (userName: string) => ({
	type: GameActions.GameActionTypes.NewGame2, userName
});

const runNewGame: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => (
	dispatch: Dispatch<AnyAction>,
	getState: () => State
) => {
	const state = getState();
	dispatch(newGame2(state.user.login));
};

const gameActionCreators = {
	gameNameChanged,
	gamePasswordChanged,
	gameVoiceChatChanged,
	gamePackageTypeChanged,
	gamePackageDataChangedRequest,
	gameTypeChanged,
	gameRoleChanged,
	showmanTypeChanged,
	playersCountChanged,
	humanPlayersCountChanged,
	gamePackageLibraryChanged,
	gameSet,
	runNewGame,
};

export default gameActionCreators;