import { connect } from 'react-redux';
import * as React from 'react';
import roomActionCreators from '../../../state/room/roomActionCreators';
import State from '../../../state/State';
import { Dispatch, Action } from 'redux';
import StakeTypes from '../../../model/enums/StakeTypes';
import localization from '../../../model/resources/localization';

interface SendStakeButtonProps {
	isConnected: boolean;
	allowedStakeTypes: Record<StakeTypes, boolean>;
	stake?: number;
	className?: string;
	sendStake: (stake?: number) => void;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isConnected,
	allowedStakeTypes: state.room.stakes.allowedStakeTypes,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	sendStake: (stake?: number) => {
		dispatch((roomActionCreators.sendStake(stake) as object) as Action);
	}
});

export function SendStakeButton(props: SendStakeButtonProps) {
	const canSendStake = props.allowedStakeTypes[StakeTypes.Sum];

	return <button
		className={props.className}
		onClick={() => props.sendStake(props.stake)}
		disabled={!props.isConnected || !canSendStake}>
			{canSendStake ? (props.stake ?? localization.send) : ''}
		</button>;
}

export default connect(mapStateToProps, mapDispatchToProps)(SendStakeButton);
