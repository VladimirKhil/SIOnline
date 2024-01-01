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
import GameHint from './GameHint';
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

	onPersonsDialogClose: () => void;
	onTablesDialogClose: () => void;
	onBannedDialogClose: () => void;
	onGameInfoDialogClose: () => void;
	onManageGameDialogClose: () => void;
	onCancelSumChange: () => void;
	onShowSettings: () => void;
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
});

export function InGameView(props: InGameViewProps) : JSX.Element {
	const isScreenWide = props.windowWidth >= Constants.WIDE_WINDOW_WIDTH;

	return (
		<section className="gameMain">
			<div className="game__tableArea">
				<div className={`gameMainView ${props.showPersonsAtBottomOnWideScreen && isScreenWide ? 'reversed' : ''}`}>
					<PlayersView />

					<div className="showmanTableArea">
						<div className="showmanProgressArea">
							<RoundProgress />
							<GameProgress />
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

			<div className={`game__mainArea ${props.floatingControls ? 'floatable' : ''}`}>
				{isScreenWide ? <GameChatView /> : null}
				<SideControlPanel />
			</div>

			{isScreenWide
				? <button className='settingsOpener' onClick={props.onShowSettings} title={localization.settings}>
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
