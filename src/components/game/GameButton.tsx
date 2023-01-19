import { connect } from 'react-redux';
import localization from '../../model/resources/localization';
import * as React from 'react';
import Sex from '../../model/enums/Sex';
import runActionCreators from '../../state/run/runActionCreators';
import State from '../../state/State';
import { Dispatch, Action } from 'redux';
import FlyoutButton, { FlyoutVerticalOrientation } from '../common/FlyoutButton';
import Constants from '../../model/enums/Constants';

import './GameButton.css';

interface GameButtonProps {
	isConnected: boolean;
	isGameButtonEnabled: boolean;
	isAfterQuestion: boolean;
	sex: Sex;
	windowWidth: number;
	areApellationsEnabled: boolean;
	playersCount: number;
	pressGameButton: () => void;
	apellate: () => void;
	disagree: () => void;
	onMarkQuestion: () => void;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isConnected,
	isGameButtonEnabled: state.run.isGameButtonEnabled,
	isAfterQuestion: state.run.stage.isAfterQuestion,
	sex: state.settings.sex,
	windowWidth: state.ui.windowWidth,
	areApellationsEnabled: state.run.areApellationsEnabled,
	playersCount: state.run.persons.players.length,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	pressGameButton: () => {
		dispatch(runActionCreators.pressGameButton() as object as Action);
	},
	apellate: () => {
		dispatch(runActionCreators.apellate() as object as Action);
	},
	disagree: () => {
		dispatch(runActionCreators.disagree() as object as Action);
	},
	onMarkQuestion: () => {
		dispatch(runActionCreators.markQuestion() as unknown as Action);
	}
});

function renderReactions(props: GameButtonProps) : JSX.Element {
	const rightString = props.sex === Sex.Female ? localization.iAmRightFemale : localization.iAmRightMale;
	
	return props.windowWidth > Constants.WIDE_WINDOW_WIDTH ? (
		<div className='reactions reactions_panel'>
			{props.areApellationsEnabled
			? (<>
				<button
					className="playerButton"
					disabled={!props.isConnected}
					title={localization.apellateAnswer}
					onClick={() => props.apellate()}>
					{rightString}
				</button>

				<button
					className="playerButton"
					disabled={!props.isConnected || props.playersCount < 4} // 2 players cannot overvote third player + showman
					title={localization.iDisagreeHint}
					onClick={() => props.disagree()}>
					{localization.iDisagree}
				</button>
			</> )
			: null}

			<button
				className="playerButton"
				disabled={!props.isConnected}
				title={localization.complainHint}
				onClick={() => props.onMarkQuestion()}>
				{localization.complain}
			</button>
		</div>
		) : (
		<FlyoutButton
			className="playerButton reactions"
			disabled={!props.isConnected}
			flyout={
				<ul className='reactions_list'>
					{props.areApellationsEnabled ? (
					<>
						<li title={localization.apellateAnswer} onClick={() => props.apellate()}>{rightString}</li>
						<li title={localization.iDisagreeHint} onClick={() => props.disagree()}>{localization.iDisagree}</li>
					</>) : null}
					<li title={localization.complainHint} onClick={() => props.onMarkQuestion()}>{localization.complain}</li>
				</ul>
			}
			alignWidth
			verticalOrientation={FlyoutVerticalOrientation.Top}
		>
			{localization.reactions}
		</FlyoutButton>
	);
}

export function GameButton(props: GameButtonProps) {
	return (
		<>
			<button
				className="playerButton"
				title={localization.gameButton}
				disabled={!props.isConnected || !props.isGameButtonEnabled}
				onClick={() => props.pressGameButton()}>
				&nbsp;
			</button>
			{props.isAfterQuestion ? renderReactions(props) : null}
		</>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(GameButton);
