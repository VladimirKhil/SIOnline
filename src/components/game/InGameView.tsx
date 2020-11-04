import * as React from 'react';
import State from '../../state/State';
import { connect } from 'react-redux';
import { Action } from 'redux';
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

import './InGameView.css';

interface InGameViewProps {
	windowWidth: number;
	isChatOpen: boolean;
	showPersonsAtBottomOnWideScreen: boolean;
	isPersonsDialogVisible: boolean;
	isAnswerValidationDialogVisible: boolean;
}

const mapStateToProps = (state: State) => ({
	windowWidth: state.ui.windowWidth,
	isChatOpen: state.run.chat.isVisible,
	showPersonsAtBottomOnWideScreen: state.settings.showPersonsAtBottomOnWideScreen,
	isPersonsDialogVisible: state.run.personsVisible,
	isAnswerValidationDialogVisible: state.run.validation.isVisible
});

const mapDispatchToProps = (dispatch: React.Dispatch<Action>) => ({

});

// tslint:disable-next-line: function-name
export function InGameView(props: InGameViewProps) {
	return (
		<section className="gameMain">
			<div className="game__tableArea">
				<div className={`gameMainView ${props.showPersonsAtBottomOnWideScreen && props.windowWidth >= 1100 ? 'reversed' : ''}`}>
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
				{props.windowWidth >= 1100 ? <GameChatView />
					: (props.isChatOpen ? (
						<div id="gameLogHost">
							<div className="sideArea">
								<div className="game__chat">
									<GameLogView />
								</div>
							</div>
							<RoundProgress />
						</div>
					) : null)}
				<SideControlPanel />
			</div>
			{props.isPersonsDialogVisible && props.windowWidth < 1100 ? <PersonsDialog isCompact={props.windowWidth >= 800} /> : null}
			{props.isAnswerValidationDialogVisible ? <AnswerValidationDialog /> : null}
		</section>
	);
}

const inGameHOC = connect(mapStateToProps, mapDispatchToProps)(InGameView);

export default inGameHOC;
