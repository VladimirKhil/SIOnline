import { connect } from 'react-redux';
import localization from '../../model/resources/localization';
import * as React from 'react';
import Sex from '../../model/enums/Sex';
import runActionCreators from '../../state/run/runActionCreators';
import Role from '../../model/enums/Role';
import State from '../../state/State';
import { Dispatch, Action } from 'redux';

interface GameButtonProps {
	isConnected: boolean;
	isGameButtonEnabled: boolean;
	isAfterQuestion: boolean;
	sex: Sex;
	pressGameButton: () => void;
	apellate: () => void;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isConnected,
	isGameButtonEnabled: state.run.isGameButtonEnabled,
	isAfterQuestion: state.run.stage.isAfterQuestion,
	sex: state.settings.sex
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	pressGameButton: () => {
		dispatch(runActionCreators.pressGameButton() as object as Action);
	},
	apellate: () => {
		dispatch(runActionCreators.apellate() as object as Action);
	}
});

export function GameButton(props: GameButtonProps) {
	return (
		<>
			<button className="playerButton" title={localization.gameButton} disabled={!props.isConnected || !props.isGameButtonEnabled}
				onClick={() => props.pressGameButton()}>&nbsp;</button>
			{props.isAfterQuestion ? (
				<button className="playerButton hoverButton" disabled={!props.isConnected} title={localization.apellateAnswer}
					onClick={() => props.apellate()}>
					{props.sex === Sex.Female ? localization.iAmRightFemale : localization.iAmRightMale}
				</button>
			) : null}
		</>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(GameButton);
