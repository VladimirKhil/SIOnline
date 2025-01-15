import * as React from 'react';
import { connect } from 'react-redux';
import { Action, Dispatch } from 'redux';
import State from '../../../state/State';
import PlayersView from '../../game/PlayersView/PlayersView';
import GameTable from '../../gameTable/GameTable/GameTable';
import GameChatView from '../../game/GameChatView/GameChatView';
import SideControlPanel from '../../game/SideControlPanel/SideControlPanel';
import ShowmanReplicView from '../../game/ShowmanReplicView/ShowmanReplicView';
import PersonsDialog from '../../game/PersonsDialog/PersonsDialog';
import GameLogView from '../../game/GameLogView/GameLogView';
import AnswerValidation from '../../game/AnswerValidation/AnswerValidation';
import RoundProgress from '../../game/RoundProgress/RoundProgress';
import localization from '../../../model/resources/localization';
import roomActionCreators from '../../../state/room/roomActionCreators';
import PersonsView from '../../game/PersonsView/PersonsView';
import TablesView from '../../game/TablesView/TablesView';
import Dialog from '../../common/Dialog/Dialog';
import ManageGameView from '../../game/ManageGameView/ManageGameView';
import Constants from '../../../model/enums/Constants';
import GameMetadataView from '../../game/GameMetadataView/GameMetadataView';
import BannedView from '../../game/BannedView/BannedView';
import TableContextView from '../../game/TableContextView/TableContextView';
import ChatInput from '../../game/ChatInput/ChatInput';
import PlayersListView from '../../game/PlayersListView/PlayersListView';
import ChatMessage from '../../../model/ChatMessage';
import MessageLevel from '../../../model/enums/MessageLevel';
import { userErrorChanged } from '../../../state/commonSlice';
import AvatarViewDialog from '../../panels/AvatarViewDialog/AvatarViewDialog';
import { AppDispatch, RootState } from '../../../state/store';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { DialogView, rejectAnswer } from '../../../state/room2Slice';
import ComplainDialog from '../../panels/ComplainDialog/ComplainDialog';
import ReportDialog from '../../panels/ReportDialog/ReportDialog';
import GameState from '../../game/GameState/GameState';
import Role from '../../../model/Role';

import './Room.css';

interface RoomProps {
	windowWidth: number;
	// eslint-disable-next-line react/no-unused-prop-types
	isChatOpen: boolean;
	isPersonsDialogVisible: boolean;
	isTablesDialogVisible: boolean;
	isBannedDialogVisible: boolean;
	isGameInfoDialogVisible: boolean;
	isManageGameDialogVisible: boolean;
	areSumsEditable: boolean;
	floatingControls: boolean;
	kicked: boolean;
	isConnected: boolean;
	isConnectedReason: string;
	avatarViewVisible: boolean;
	role: Role;

	onPersonsDialogClose: () => void;
	onTablesDialogClose: () => void;
	onBannedDialogClose: () => void;
	onGameInfoDialogClose: () => void;
	onManageGameDialogClose: () => void;
	onCancelSumChange: () => void;
	onExit: (appDispatch: AppDispatch) => void;
	chatMessageAdded: (chatMessage: ChatMessage) => void;
	onReconnect: () => void;
	clearDecisions: () => void;
}

const mapStateToProps = (state: State) => ({
	windowWidth: state.ui.windowWidth,
	isChatOpen: state.room.chat.isVisible,
	isPersonsDialogVisible: state.room.personsVisible,
	isTablesDialogVisible: state.room.tablesVisible,
	isBannedDialogVisible: state.room.bannedVisible,
	isGameInfoDialogVisible: state.room.gameInfoVisible,
	isManageGameDialogVisible: state.room.manageGameVisible,
	areSumsEditable: state.room.areSumsEditable,
	floatingControls: state.settings.floatingControls,
	kicked: state.room.kicked,
	isConnected: state.common.isSIHostConnected,
	isConnectedReason: state.common.isSIHostConnectedReason,
	avatarViewVisible: state.room.avatarViewVivible,
	role: state.room.role,
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
	onExit: (appDispatch: AppDispatch) => {
		dispatch(roomActionCreators.exitGame(appDispatch) as unknown as Action);
	},
	chatMessageAdded: (chatMessage: ChatMessage) => {
		dispatch(roomActionCreators.chatMessageAdded(chatMessage) as unknown as Action);
	},
	onReconnect: () => {
		dispatch(roomActionCreators.onReconnect() as unknown as Action);
	},
	clearDecisions: () => {
		dispatch(roomActionCreators.clearDecisions());
	},
});

function getDialog(dialogView: DialogView) : JSX.Element | null {
	switch (dialogView) {
		case DialogView.None:
			return null;

		case DialogView.Complain:
			return <ComplainDialog />;

		case DialogView.Report:
			return <ReportDialog />;

		default:
			return null;
	}
}

export function Room(props: RoomProps) : JSX.Element {
	const appDispatch = useAppDispatch();
	const state = useAppSelector((rootState: RootState) => rootState.room2);

	React.useEffect(() => {
		if (props.kicked) {
			appDispatch(userErrorChanged(localization.youAreKicked));
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

	const onReject = (factor: number) => {
		appDispatch(rejectAnswer(factor));
		props.clearDecisions();
	};

	return (
		<section className="gameMain">
			<div className="game__tableArea">
				<div className={`gameMainView ${isScreenWide ? 'reversed' : ''}`}>
					<PlayersView />

					<div className="showmanTableArea">
						<div className="showmanProgressArea">
							<div className='progressArea'>
								<GameState />
								<RoundProgress />
							</div>

							<ShowmanReplicView />
						</div>

						<div className="tableArea">
							<GameTable />
							<TableContextView />

							{props.isChatOpen && !isScreenWide ? (
								<div className="compactChatView">
									<div className='compactChatHeader'>{localization.chat}</div>

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

			{state.validation.queue.length > 0 && (!isScreenWide || props.role === Role.Player) ? (
				<Dialog className='answerValidationDialog' title={state.validation.header} onClose={() => onReject(1.0)}>
					<AnswerValidation />
				</Dialog>
			) : null}
			{props.avatarViewVisible ? <AvatarViewDialog /> : null}
			{getDialog(state.dialogView)}
		</section>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(Room);
