import * as React from 'react';
import { connect } from 'react-redux';
import { Action, Dispatch } from 'redux';
import State from '../../state/State';
import PlayersView from './PlayersView';
import GameTable from '../gameTable/GameTable';
import GameChatView from './GameChatView';
import SideControlPanel from './SideControlPanel';
import ShowmanReplicView from './ShowmanReplicView';
import PersonsDialog from './PersonsDialog';
import GameLogView from './GameLogView';
import AnswerValidationDialog from './AnswerValidationDialog';
import RoundProgress from './RoundProgress';
import localization from '../../model/resources/localization';
import roomActionCreators from '../../state/room/roomActionCreators';
import uiActionCreators from '../../state/ui/uiActionCreators';
import PersonsView from './PersonsView';
import TablesView from './TablesView';
import Dialog from '../common/Dialog';
import ManageGameView from './ManageGameView';
import Constants from '../../model/enums/Constants';
import GameMetadataView from './GameMetadataView';
import BannedView from './BannedView';
import TableContextView from './TableContextView/TableContextView';
import ChatInput from './ChatInput';
import PlayersListView from './PlayersListView/PlayersListView';
import GameProgress from './GameProgress';
import ChatMessage from '../../model/ChatMessage';
import MessageLevel from '../../model/enums/MessageLevel';
import commonActionCreators from '../../state/common/commonActionCreators';

import './InGameView.css';

interface InGameViewProps {
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

	onPersonsDialogClose: () => void;
	onTablesDialogClose: () => void;
	onBannedDialogClose: () => void;
	onGameInfoDialogClose: () => void;
	onManageGameDialogClose: () => void;
	onCancelSumChange: () => void;
	onShowSettings: () => void;
	onExit: () => void;
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
	isConnected: state.common.isConnected,
	isConnectedReason: state.common.isConnectedReason,
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
	onExit: () => {
		dispatch(roomActionCreators.exitGame() as unknown as Action);
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

export function InGameView(props: InGameViewProps) : JSX.Element {
	React.useEffect(() => {
		if (props.kicked) {
			props.onUserError(localization.youAreKicked);
			props.onExit();
		}
	}, [props.kicked]);

	const prevPropsRef = React.useRef<InGameViewProps>();

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

	const isScreenWide = props.windowWidth >= Constants.WIDE_WINDOW_WIDTH;

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

			{isScreenWide
				? <button type='button' className='settingsOpener' onClick={props.onShowSettings} title={localization.settings}>
					<span>⚙</span>
				</button>
				: null}

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
		</section>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(InGameView);
