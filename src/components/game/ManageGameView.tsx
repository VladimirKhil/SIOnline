import * as React from 'react';
import State from '../../state/State';
import { connect } from 'react-redux';
import runActionCreators from '../../state/run/runActionCreators';
import { Action, Dispatch } from 'redux';

import './ManageGameView.css';

interface ManageGameViewProps {
	roundsNames: string[] | null;
	roundIndex: number;
	navigateToRound: (roundIndex: number) => void;
	onClose: () => void;
}

const mapStateToProps = (state: State) => ({
	roundsNames: state.run.roundsNames,
	roundIndex: state.run.stage.roundIndex,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	navigateToRound: (roundIndex: number) => {
		dispatch(runActionCreators.navigateToRound(roundIndex) as unknown as Action);
	}
});

export function ManageGameView(props: ManageGameViewProps) {
	return (
		<div className='manageGameView'>
			{props.roundsNames?.map((name, index) => (
				<button
					key={index}
					className={index === props.roundIndex ? 'activeRound' : ''}
					onClick={() => { props.navigateToRound(index); props.onClose(); }}
				>
					{name}
				</button>))}
		</div>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(ManageGameView);
