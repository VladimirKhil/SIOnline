import * as React from 'react';
import State from '../../../state/State';
import { connect } from 'react-redux';
import roomActionCreators from '../../../state/room/roomActionCreators';
import { Action, Dispatch } from 'redux';
import { useAppSelector } from '../../../state/hooks';

import './ManageGameView.css';

interface ManageGameViewProps {
	roundIndex: number;
	navigateToRound: (roundIndex: number) => void;
	onClose: () => void;
}

const mapStateToProps = (state: State) => ({
	roundIndex: state.room.stage.roundIndex,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	navigateToRound: (roundIndex: number) => {
		dispatch(roomActionCreators.navigateToRound(roundIndex) as unknown as Action);
	}
});

export function ManageGameView(props: ManageGameViewProps) {
	const roundsNames = useAppSelector(state => state.room2.roundsNames);

	return (
		<div className='manageGameView'>
			{roundsNames?.map((name, index) => (
				<button
					type='button'
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
