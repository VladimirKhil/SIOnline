import * as React from 'react';
import { connect } from 'react-redux';
import { Action, Dispatch } from 'redux';
import State from '../../state/State';
import PlayersView from './PlayersView';
import BottomControlPanel from './BottomControlPanel';
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
import runActionCreators from '../../state/run/runActionCreators';
import PersonsView from './PersonsView';
import TablesView from './TablesView';
import Dialog from '../common/Dialog';
import ManageGameView from './ManageGameView';

import './InGameView.css';

interface InGameViewProps {
	windowWidth: number;
	// eslint-disable-next-line react/no-unused-prop-types
	isChatOpen: boolean;
	showPersonsAtBottomOnWideScreen: boolean;
	isPersonsDialogVisible: boolean;
	isTablesDialogVisible: boolean;
	isAnswerValidationDialogVisible: boolean;
	isManageGameDialogVisible: boolean;

	onPersonsDialogClose: () => void;
	onTablesDialogClose: () => void;
	onManageGameDialogClose: () => void;
}

const mapStateToProps = (state: State) => ({
	windowWidth: state.ui.windowWidth,
	isChatOpen: state.run.chat.isVisible,
	showPersonsAtBottomOnWideScreen: state.settings.showPersonsAtBottomOnWideScreen,
	isPersonsDialogVisible: state.run.personsVisible,
	isTablesDialogVisible: state.run.tablesVisible,
	isManageGameDialogVisible: state.run.manageGameVisible,
	isAnswerValidationDialogVisible: state.run.validation.isVisible
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onPersonsDialogClose: () => {
		dispatch(runActionCreators.runHidePersons());
	},
	onTablesDialogClose: () => {
		dispatch(runActionCreators.runHideTables());
	},
	onManageGameDialogClose: () => {
		dispatch(runActionCreators.runHideManageGame());
	}
});

function getMainAreaContent(props: InGameViewProps): React.ReactNode {
	if (props.windowWidth >= 1100) {
		return <GameChatView />;
	}

	return props.isChatOpen ? (
		<div id="gameLogHost">
			<div className="sideArea">
				<div className="game__chat">
					<GameLogView />
				</div>
			</div>
			<RoundProgress />
		</div>
	) : null;
}

export function InGameView(props: InGameViewProps) : JSX.Element {
	const isScreenWide = props.windowWidth >= 1100;

	return (
		<section className="gameMain">
			<div className="game__tableArea">
				<div className={`gameMainView ${props.showPersonsAtBottomOnWideScreen && isScreenWide ? 'reversed' : ''}`}>
					<PlayersView />
					<div className="showmanTableArea">
						<ShowmanReplicView />
						<div className="tableArea">
							<GameTable />
							<GameHint />
						</div>
					</div>
				</div>
				<BottomControlPanel />
			</div>
			<div className="game__mainArea">
				{getMainAreaContent(props)}
				<SideControlPanel />
			</div>
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
			{props.isManageGameDialogVisible && !isScreenWide ? (
				<Dialog className='manageGameDialog' title={localization.game} onClose={props.onManageGameDialogClose}>
					<ManageGameView onClose={props.onManageGameDialogClose} />
				</Dialog>
			) : null}
			{props.isAnswerValidationDialogVisible ? <AnswerValidationDialog /> : null}
		</section>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(InGameView);
