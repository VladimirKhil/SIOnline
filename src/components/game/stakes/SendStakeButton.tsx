import { connect } from 'react-redux';
import * as React from 'react';
import runActionCreators from '../../../state/run/runActionCreators';
import State from '../../../state/State';
import { Dispatch, Action } from 'redux';
import StakeTypes from '../../../model/enums/StakeTypes';

interface SendStakeButtonProps {
	allowedStakeTypes: Record<StakeTypes, boolean>;
	stake: number;
	sendStake: () => void;
}

const mapStateToProps = (state: State) => ({
	allowedStakeTypes: state.run.stakes.allowedStakeTypes,
	stake: state.run.stakes.stake
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	sendStake: () => {
		dispatch((runActionCreators.sendStake() as object) as Action);
	}
});

// tslint:disable-next-line: function-name
export function SendStakeButton(props: SendStakeButtonProps) {
	const canSendStake = props.allowedStakeTypes[StakeTypes.Sum];

	return <button onClick={() => props.sendStake()} disabled={!canSendStake}>{canSendStake ? props.stake : ''}</button>;
}

export default connect(mapStateToProps, mapDispatchToProps)(SendStakeButton);
