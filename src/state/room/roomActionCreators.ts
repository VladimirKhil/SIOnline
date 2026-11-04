import { ActionCreator, Action, Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import * as RunActions from './RoomActions';
import State from '../State';
import DataContext from '../../model/DataContext';
import StakeModes from '../../client/game/StakeModes';

const giveTurn: ActionCreator<ThunkAction<void, State, DataContext, Action>> = () => async (dispatch: Dispatch<RunActions.KnownRoomAction>) => {
	dispatch(selectionEnabled());
};

const runShowPersons: ActionCreator<RunActions.RunShowPersonsAction> = () => ({
	type: RunActions.RoomActionTypes.RoomShowPersons
});

const runHidePersons: ActionCreator<RunActions.RunHidePersonsAction> = () => ({
	type: RunActions.RoomActionTypes.RoomHidePersons
});

const runShowBanned: ActionCreator<RunActions.RunShowBannedAction> = () => ({
	type: RunActions.RoomActionTypes.RoomShowBanned
});

const runHideBanned: ActionCreator<RunActions.RunHideBannedAction> = () => ({
	type: RunActions.RoomActionTypes.RoomHideBanned
});

const runShowGameInfo: ActionCreator<RunActions.RunShowGameInfoAction> = () => ({
	type: RunActions.RoomActionTypes.RoomShowGameInfo
});

const runHideGameInfo: ActionCreator<RunActions.RunHideGameInfoAction> = () => ({
	type: RunActions.RoomActionTypes.RoomHideGameInfo
});

const runShowManageGame: ActionCreator<RunActions.RunShowManageGameAction> = () => ({
	type: RunActions.RoomActionTypes.RoomShowManageGame
});

const runHideManageGame: ActionCreator<RunActions.RunHideManageGameAction> = () => ({
	type: RunActions.RoomActionTypes.RoomHideManageGame
});

const clearDecisions: ActionCreator<RunActions.ClearDecisionsAction> = () => ({
	type: RunActions.RoomActionTypes.ClearDecisions
});

const tableSelected: ActionCreator<RunActions.TableSelectedAction> = (tableIndex: number) => ({
	type: RunActions.RoomActionTypes.TableSelected, tableIndex
});

const stageChanged: ActionCreator<RunActions.StageChangedAction> = (stageName: string, roundIndex: number) => ({
	type: RunActions.RoomActionTypes.StageChanged, stageName, roundIndex
});

const gameStateCleared: ActionCreator<RunActions.GameStateClearedAction> = () => ({
	type: RunActions.RoomActionTypes.GameStateCleared
});

const afterQuestionStateChanged: ActionCreator<RunActions.AfterQuestionStateChangedAction> = (isAfterQuestion: boolean) => ({
	type: RunActions.RoomActionTypes.AfterQuestionStateChanged, isAfterQuestion
});

const isQuestionChanged: ActionCreator<RunActions.IsQuestionChangedAction> = (isQuestion: boolean, questionType: string) => ({
	type: RunActions.RoomActionTypes.IsQuestionChanged, isQuestion, questionType,
});

const currentPriceChanged: ActionCreator<RunActions.CurrentPriceChangedAction> = (currentPrice: number) => ({
	type: RunActions.RoomActionTypes.CurrentPriceChanged, currentPrice
});

const setStakes: ActionCreator<RunActions.SetStakesAction> = (
	stakeModes: StakeModes,
	minimum: number,
	maximum: number,
	step: number,
	playerName: string | null,
) => ({
	type: RunActions.RoomActionTypes.SetStakes, stakeModes, minimum, maximum, step, playerName
});

const stakeChanged: ActionCreator<RunActions.StakeChangedAction> = (stake: number) => ({
	type: RunActions.RoomActionTypes.StakeChanged, stake
});

const selectionEnabled: ActionCreator<RunActions.SelectionEnabledAction> = () => ({
	type: RunActions.RoomActionTypes.SelectionEnabled
});

const gameMetadataChanged: ActionCreator<RunActions.GameMetadataChangedAction> = (
	gameName: string,
	packageName: string,
	contactUri: string,
	voiceChatUri: string | null
) => ({
	type: RunActions.RoomActionTypes.GameMetadataChanged, gameName, packageName, contactUri, voiceChatUri
});

const bannedListChanged: ActionCreator<RunActions.BannedListChangedAction> = (bannedList: Record<string, string>) => ({
	type: RunActions.RoomActionTypes.BannedListChanged, bannedList
});

const banned: ActionCreator<RunActions.BannedAction> = (ip: string, name: string) => ({
	type: RunActions.RoomActionTypes.Banned, ip, name
});

const unbanned: ActionCreator<RunActions.UnbannedAction> = (ip: string) => ({
	type: RunActions.RoomActionTypes.Unbanned, ip
});

const selectBannedItem: ActionCreator<RunActions.SelectBannedItemAction> = (ip: string) => ({
	type: RunActions.RoomActionTypes.SelectBannedItem, ip
});

const roomActionCreators = {
	giveTurn,
	runShowPersons,
	runHidePersons,
	runShowBanned,
	runHideBanned,
	runShowGameInfo,
	runHideGameInfo,
	runShowManageGame,
	runHideManageGame,
	tableSelected,
	stageChanged,
	gameStateCleared,
	afterQuestionStateChanged,
	isQuestionChanged,
	currentPriceChanged,
	clearDecisions,
	setStakes,
	stakeChanged,
	selectionEnabled,
	gameMetadataChanged,
	bannedListChanged,
	banned,
	unbanned,
	selectBannedItem,
};

export default roomActionCreators;
