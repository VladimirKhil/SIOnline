import { connect } from 'react-redux';
import * as React from 'react';
import roomActionCreators from '../../../state/room/roomActionCreators';
import State from '../../../state/State';
import { Dispatch, Action } from 'redux';
import StakeModes from '../../../client/game/StakeModes';

interface StakeSumEditorProps {
	stake: number;
	minimum: number;
	maximum: number;
	step: number;
	stakeModes: StakeModes;
	type: 'number' | 'range';
	className: string;
	onStakeChanged: (stake: number) => void;
}

const mapStateToProps = (state: State) => ({
	stake: state.room.stakes.stake,
	minimum: state.room.stakes.minimum,
	maximum: state.room.stakes.maximum,
	step: state.room.stakes.step,
	stakeModes: state.room.stakes.stakeModes,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onStakeChanged: (stake: number) => {
		dispatch(roomActionCreators.stakeChanged(stake));
	}
});

export function StakeSumEditor(props: StakeSumEditorProps) {
	const canSendStake = props.stakeModes & StakeModes.Stake;

	const onStakeChanged = (stake: number) => {
		if (stake <= 0 || stake > props.maximum) { // Can be < minimum as user could be printing a larger value
			return;
		}

		props.onStakeChanged(stake);
	};

	return (
		<input
			aria-label='Stake'
			type={props.type}
			className={props.className}
			disabled={!canSendStake}
			min={props.minimum}
			max={props.maximum}
			step={props.step}
			value={props.stake}
			onChange={e => onStakeChanged(parseInt(e.target.value, 10))}
		/>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(StakeSumEditor);
