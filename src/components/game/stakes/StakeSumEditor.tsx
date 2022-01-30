import { connect } from 'react-redux';
import * as React from 'react';
import runActionCreators from '../../../state/run/runActionCreators';
import State from '../../../state/State';
import { Dispatch, Action } from 'redux';
import StakeTypes from '../../../model/enums/StakeTypes';

interface StakeSumEditorProps {
	stake: number;
	minimum: number;
	maximum: number;
	step: number;
	allowedStakeTypes: Record<StakeTypes, boolean>;
	type: 'number' | 'range';
	className: string;
	onStakeChanged: (stake: number) => void;
}

const mapStateToProps = (state: State) => ({
	stake: state.run.stakes.stake,
	minimum: state.run.stakes.minimum,
	maximum: state.run.stakes.maximum,
	step: state.run.stakes.step,
	allowedStakeTypes: state.run.stakes.allowedStakeTypes
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onStakeChanged: (stake: number) => {
		dispatch(runActionCreators.stakeChanged(stake));
	}
});

export function StakeSumEditor(props: StakeSumEditorProps) {
	const canSendStake = props.allowedStakeTypes[StakeTypes.Sum];

	return (
		<input
			type={props.type}
			className={props.className}
			disabled={!canSendStake}
			min={props.minimum}
			max={props.maximum}
			step={props.step}
			value={props.stake}
			onChange={e => props.onStakeChanged(parseInt(e.target.value, 10))}
		/>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(StakeSumEditor);
