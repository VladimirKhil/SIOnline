import { connect } from 'react-redux';
import * as React from 'react';
import roomActionCreators from '../../../state/room/roomActionCreators';
import State from '../../../state/State';
import { Dispatch, Action } from 'redux';
import StakeTypes from '../../../model/enums/StakeTypes';

interface SendStakeButtonProps {
	isConnected: boolean;
	allowedStakeTypes: Record<StakeTypes, boolean>;
	stake: number;
	sendStake: () => void;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isConnected,
	allowedStakeTypes: state.room.stakes.allowedStakeTypes,
	stake: state.room.stakes.stake
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	sendStake: () => {
		dispatch((roomActionCreators.sendStake() as object) as Action);
	}
});

export function SendStakeButton(props: SendStakeButtonProps) {
	const canSendStake = props.allowedStakeTypes[StakeTypes.Sum];

	return <button onClick={() => props.sendStake()} disabled={!props.isConnected || !canSendStake}>{canSendStake ? props.stake : ''}</button>;
}

export default connect(mapStateToProps, mapDispatchToProps)(SendStakeButton);
