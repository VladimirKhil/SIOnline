import { connect } from 'react-redux';
import * as React from 'react';
import roomActionCreators from '../../../state/room/roomActionCreators';
import State from '../../../state/State';
import { Dispatch, Action } from 'redux';
import localization from '../../../model/resources/localization';
import { useAppDispatch } from '../../../state/hooks';
import { sendStake, setIsDecisionNeeded } from '../../../state/room2Slice';
import StakeModes from '../../../client/game/StakeModes';

interface SendStakeButtonProps {
	isConnected: boolean;
	stakeModes: StakeModes;
	stake?: number;
	defaultStake: number;
	className?: string;
	clearDecisions: () => void;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isSIHostConnected,
	stakeModes: state.room.stakes.stakeModes,
	defaultStake: state.room.stakes.stake,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	clearDecisions: () => {
		dispatch(roomActionCreators.clearDecisions());
	},
});

export function SendStakeButton(props: SendStakeButtonProps) {
	const appDispatch = useAppDispatch();
	const canSendStake = props.stakeModes & StakeModes.Stake;

	const sendStake2 = () => {
		const stake = props.stake ?? props.defaultStake;
		appDispatch(sendStake(stake));
		appDispatch(setIsDecisionNeeded(false));
		props.clearDecisions();
	};

	return <button
		type='button'
		className={`mainAction active ${props.className}`}
		onClick={sendStake2}
		disabled={!props.isConnected || !canSendStake}>
			{canSendStake ? (props.stake ?? localization.send) : ''}
		</button>;
}

export default connect(mapStateToProps, mapDispatchToProps)(SendStakeButton);
