import { connect } from 'react-redux';
import * as React from 'react';
import roomActionCreators from '../../../state/room/roomActionCreators';
import State from '../../../state/State';
import { Dispatch, Action } from 'redux';
import StakeTypes from '../../../model/enums/StakeTypes';
import localization from '../../../model/resources/localization';
import { useAppDispatch } from '../../../state/new/hooks';
import { sendStake } from '../../../state/new/room2Slice';

interface SendStakeButtonProps {
	isConnected: boolean;
	allowedStakeTypes: Record<StakeTypes, boolean>;
	stake?: number;
	defaultStake: number;
	className?: string;
	stakeMessage: string;
	clearDecisions: () => void;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isSIHostConnected,
	allowedStakeTypes: state.room.stakes.allowedStakeTypes,
	defaultStake: state.room.stakes.stake,
	stakeMessage: state.room.stakes.message,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	clearDecisions: () => {
		dispatch(roomActionCreators.clearDecisions());
	},
});

export function SendStakeButton(props: SendStakeButtonProps) {
	const appDispatch = useAppDispatch();
	const canSendStake = props.allowedStakeTypes[StakeTypes.Sum];

	const sendStake2 = () => {
		const stake = props.stake ?? props.defaultStake;
		appDispatch(sendStake({ message: props.stakeMessage, stake }));
		props.clearDecisions();
	};

	return <button
		type='button'
		className={props.className}
		onClick={sendStake2}
		disabled={!props.isConnected || !canSendStake}>
			{canSendStake ? (props.stake ?? localization.send) : ''}
		</button>;
}

export default connect(mapStateToProps, mapDispatchToProps)(SendStakeButton);
