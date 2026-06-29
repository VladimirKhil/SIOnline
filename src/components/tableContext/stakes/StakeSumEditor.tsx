import { connect } from 'react-redux';
import * as React from 'react';
import roomActionCreators from '../../../state/room/roomActionCreators';
import State from '../../../state/State';
import { Dispatch, Action } from 'redux';
import StakeModes from '../../../client/game/StakeModes';
import { useAppDispatch } from '../../../state/hooks';
import { sendStake } from '../../../state/room2Slice';

interface StakeSumEditorProps {
	stake: number;
	minimum: number;
	maximum: number;
	step: number;
	stakeModes: StakeModes;
	type: 'number' | 'range';
	className: string;
	onStakeChanged: (stake: number) => void;
	isConnected: boolean;
	clearDecisions: () => void;
}

const mapStateToProps = (state: State) => ({
	stake: state.room.stakes.stake,
	minimum: state.room.stakes.minimum,
	maximum: state.room.stakes.maximum,
	step: state.room.stakes.step,
	stakeModes: state.room.stakes.stakeModes,
	isConnected: state.common.isSIHostConnected,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onStakeChanged: (stake: number) => {
		dispatch(roomActionCreators.stakeChanged(stake));
	},
	clearDecisions: () => {
		dispatch(roomActionCreators.clearDecisions());
	},
});

export function StakeSumEditor(props: StakeSumEditorProps) {
	const appDispatch = useAppDispatch();
	const canSendStake = props.stakeModes & StakeModes.Stake;

	const onStakeChanged = (stake: number) => {
		if (stake <= 0 || stake > props.maximum) { // Can be < minimum as user could be printing a larger value
			return;
		}

		props.onStakeChanged(stake);
	};

	const onBlur = (stake: number) => {
		if (stake < props.minimum) {
			props.onStakeChanged(props.minimum);
			return;
		}
	};

	const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (props.type === 'number' && e.key === 'Enter') {
			if (props.isConnected && canSendStake) {
				let finalStake = props.stake;
				if (finalStake < props.minimum) {
					finalStake = props.minimum;
					props.onStakeChanged(finalStake);
				}
				appDispatch(sendStake(finalStake));
				props.clearDecisions();
			}
		}
	};

	return (
		<input
			aria-label='Stake'
			type={props.type}
			className={props.className}
			disabled={!props.isConnected || !canSendStake}
			min={props.minimum}
			max={props.maximum}
			step={props.step}
			value={props.stake}
			onChange={e => onStakeChanged(parseInt(e.target.value, 10))}
			onBlur={e => onBlur(parseInt(e.target.value, 10))}
			onKeyDown={onKeyDown}
		/>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(StakeSumEditor);

