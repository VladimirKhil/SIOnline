import * as React from 'react';
import { connect } from 'react-redux';
import { Action, Dispatch } from 'redux';
import State from '../../../state/State';
import PlayersView from '../../game/PlayersView';
import GameTable from '../../gameTable/GameTable';
import GameChatView from '../../game/GameChatView';
import SideControlPanel from '../../game/SideControlPanel';
import ShowmanReplicView from '../../game/ShowmanReplicView';
import PersonsDialog from '../../game/PersonsDialog';
import GameLogView from '../../game/GameLogView';
import AnswerValidationDialog from '../../game/AnswerValidationDialog';
import RoundProgress from '../../game/RoundProgress';
import localization from '../../../model/resources/localization';
import roomActionCreators from '../../../state/room/roomActionCreators';
import uiActionCreators from '../../../state/ui/uiActionCreators';
import PersonsView from '../../game/PersonsView';
import TablesView from '../../game/TablesView';
import Dialog from '../../common/Dialog';
import ManageGameView from '../../game/ManageGameView';
import Constants from '../../../model/enums/Constants';
import GameMetadataView from '../../game/GameMetadataView';
import BannedView from '../../game/BannedView';
import TableContextView from '../../game/TableContextView/TableContextView';
import ChatInput from '../../game/ChatInput';
import PlayersListView from '../../game/PlayersListView/PlayersListView';
import GameProgress from '../../game/GameProgress';
import ChatMessage from '../../../model/ChatMessage';
import MessageLevel from '../../../model/enums/MessageLevel';
import commonActionCreators from '../../../state/common/commonActionCreators';
import RoomSettingsButton from '../../RoomSettingsButton/RoomSettingsButton';
import AvatarViewDialog from '../../panels/AvatarViewDialog/AvatarViewDialog';
import { AppDispatch, RootState } from '../../../state/new/store';
import { useAppDispatch, useAppSelector } from '../../../state/new/hooks';
import { DialogView } from '../../../state/new/room2Slice';
import ComplainDialog from '../../panels/ComplainDialog/ComplainDialog';

import './Room.css';

interface RoomProps {
	windowWidth: number;
	// eslint-disable-next-line react/no-unused-prop-types
	isChatOpen: boolean;
	showPersonsAtBottomOnWideScreen: boolean;
	isPersonsDialogVisible: boolean;
	isTablesDialogVisible: boolean;
	isBannedDialogVisible: boolean;
	isGameInfoDialogVisible: boolean;
	isAnswerValidationDialogVisible: boolean;
	isManageGameDialogVisible: boolean;
	areSumsEditable: boolean;
	floatingControls: boolean;
	kicked: boolean;
	isConnected: boolean;
	isConnectedReason: string;
	avatarViewVisible: boolean;

	onPersonsDialogClose: () => void;
	onTablesDialogClose: () => void;
	onBannedDialogClose: () => void;
	onGameInfoDialogClose: () => void;
	onManageGameDialogClose: () => void;
	onCancelSumChange: () => void;
	onShowSettings: () => void;
	onExit: (appDispatch: AppDispatch) => void;
	chatMessageAdded: (chatMessage: ChatMessage) => void;
	onReconnect: () => void;
	onUserError: (error: string) => void;
}

const mapStateToProps = (state: State) => ({
	windowWidth: state.ui.windowWidth,
	isChatOpen: state.room.chat.isVisible,
	showPersonsAtBottomOnWideScreen: state.settings.showPersonsAtBottomOnWideScreen,
	isPersonsDialogVisible: state.room.personsVisible,
	isTablesDialogVisible: state.room.tablesVisible,
	isBannedDialogVisible: state.room.bannedVisible,
	isGameInfoDialogVisible: state.room.gameInfoVisible,
	isManageGameDialogVisible: state.room.manageGameVisible,
	isAnswerValidationDialogVisible: state.room.validation.isVisible,
	areSumsEditable: state.room.areSumsEditable,
	floatingControls: state.settings.floatingControls,
	kicked: state.room.kicked,
	isConnected: state.common.isSIHostConnected,
	isConnectedReason: state.common.isSIHostConnectedReason,
	avatarViewVisible: state.room.avatarViewVivible,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onPersonsDialogClose: () => {
		dispatch(roomActionCreators.runHidePersons());
	},
	onTablesDialogClose: () => {
		dispatch(roomActionCreators.runHideTables());
	},
	onBannedDialogClose: () => {
		dispatch(roomActionCreators.runHideBanned());
	},
	onGameInfoDialogClose: () => {
		dispatch(roomActionCreators.runHideGameInfo());
	},
	onManageGameDialogClose: () => {
		dispatch(roomActionCreators.runHideManageGame());
	},
	onCancelSumChange: () => {
		dispatch(roomActionCreators.areSumsEditableChanged(false) as object as Action);
	},
	onShowSettings: () => {
		dispatch(uiActionCreators.showSettings(true));
	},
	onExit: (appDispatch: AppDispatch) => {
		dispatch(roomActionCreators.exitGame(appDispatch) as unknown as Action);
	},
	chatMessageAdded: (chatMessage: ChatMessage) => {
		dispatch(roomActionCreators.chatMessageAdded(chatMessage) as unknown as Action);
	},
	onReconnect: () => {
		dispatch(roomActionCreators.onReconnect() as unknown as Action);
	},
	onUserError: (error: string) => {
		dispatch(commonActionCreators.onUserError(error) as any);
	}
});

function getDialog(dialogView: DialogView) : JSX.Element | null {
	switch (dialogView) {
		case DialogView.None:
			return null;

		case DialogView.Complain:
			return <ComplainDialog />;

		default:
			return null;
	}
}

export function Room(props: RoomProps) : JSX.Element {
	const appDispatch = useAppDispatch();
	const state = useAppSelector((rootState: RootState) => rootState.room2);

	React.useEffect(() => {
		if (props.kicked) {
			props.onUserError(localization.youAreKicked);
			props.onExit(appDispatch);
		}
	}, [props.kicked]);

	const prevPropsRef = React.useRef<RoomProps>();

	React.useEffect(() => {
		prevPropsRef.current = prevPropsRef.current || props;
	});

	React.useEffect(() => {
		if (prevPropsRef.current && prevPropsRef.current.isConnected !== props.isConnected) {
			prevPropsRef.current = props;
			props.chatMessageAdded({ sender: '', text: props.isConnectedReason, level: MessageLevel.System });

			if (props.isConnected) {
				props.onReconnect();
			}
		}
	}, [props.isConnected]);

	const isScreenWide = props.windowWidth >= Constants.WIDE_WINDOW_WIDTH; // TODO: try to replace with CSS

	return (
		<section className="gameMain">
			<div className="game__tableArea">
				<div className={`gameMainView ${props.showPersonsAtBottomOnWideScreen && isScreenWide ? 'reversed' : ''}`}>
					<PlayersView />

					<div className="showmanTableArea">
						<div className="showmanProgressArea">
							<div className='progressArea'>
								<RoundProgress />
								<GameProgress />
							</div>

							<ShowmanReplicView />
						</div>

						<div className="tableArea">
							<GameTable />
							<TableContextView />

							{props.isChatOpen && !isScreenWide ? (
								<div className="compactChatView">
									<div className="sideArea">
										<div className="game__chat">
											<GameLogView />
										</div>
									</div>

									<ChatInput />
								</div>
							) : null}
						</div>
					</div>
				</div>
			</div>

			<div className={`game__mainArea ${props.floatingControls && isScreenWide ? 'floatable' : ''}`}>
				{isScreenWide ? <GameChatView /> : null}
				<SideControlPanel />
			</div>

			{isScreenWide ? <RoomSettingsButton /> : null}

			{/* TODO: Switch to a single enum here */}

			{props.isPersonsDialogVisible && !isScreenWide ? (
				<PersonsDialog title={localization.members} onClose={props.onPersonsDialogClose}>
					<PersonsView />
				</PersonsDialog>
			) : null}

			{props.isTablesDialogVisible && !isScreenWide ? (
				<PersonsDialog title={localization.tables} onClose={props.onTablesDialogClose}>
					<TablesView />
				</PersonsDialog>
			) : null}

			{props.isBannedDialogVisible && !isScreenWide ? (
				<PersonsDialog title={localization.bannedList} onClose={props.onBannedDialogClose}>
					<BannedView />
				</PersonsDialog>
			) : null}

			{props.isGameInfoDialogVisible && !isScreenWide ? (
				<Dialog className='gameInfoDialog' title={localization.gameInfo} onClose={props.onGameInfoDialogClose}>
					<GameMetadataView />
				</Dialog>
			) : null}

			{props.isManageGameDialogVisible && !isScreenWide ? (
				<Dialog className='manageGameDialog' title={localization.game} onClose={props.onManageGameDialogClose}>
					<ManageGameView onClose={props.onManageGameDialogClose} />
				</Dialog>
			) : null}

			{props.areSumsEditable && !isScreenWide ? (
				<Dialog className='sumEditDialog' title={localization.changeSums} onClose={props.onCancelSumChange}>
					<PlayersListView />
				</Dialog>
			) : null}

			{props.isAnswerValidationDialogVisible ? <AnswerValidationDialog /> : null}
			{props.avatarViewVisible ? <AvatarViewDialog /> : null}
			{getDialog(state.dialogView)}
		</section>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(Room);
