import * as React from 'react';
import State from '../../../state/State';
import { connect } from 'react-redux';
import { navigateToRound } from '../../../state/serverActions';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';

import './ManageGameView.css';

interface ManageGameViewProps {
	roundIndex: number;
	onClose: () => void;
}

const mapStateToProps = (state: State) => ({
	roundIndex: state.room.stage.roundIndex,
});

export function ManageGameView(props: ManageGameViewProps) {
	const appDispatch = useAppDispatch();
	const roundsNames = useAppSelector(state => state.room2.roundsNames);

	return (
		<div className='manageGameView'>
			{roundsNames?.map((name, index) => (
				<button
					type='button'
					key={index}
					className={index === props.roundIndex ? 'activeRound' : ''}
					onClick={() => { appDispatch(navigateToRound(index)); props.onClose(); }}
				>
					{name}
				</button>))}
		</div>
	);
}

export default connect(mapStateToProps)(ManageGameView);
