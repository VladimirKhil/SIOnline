import { connect } from 'react-redux';
import * as React from 'react';
import roomActionCreators from '../../../../state/room/roomActionCreators';
import State from '../../../../state/State';
import { Dispatch, Action } from 'redux';
import localization from '../../../../model/resources/localization';
import { useAppDispatch } from '../../../../state/hooks';
import { DecisionType, sendPass, setDecisionType } from '../../../../state/room2Slice';
import StakeModes from '../../../../client/game/StakeModes';

import './SendPassButton.scss';

interface SendPassButtonProps {
	isConnected: boolean;
	stakeModes: StakeModes;
	className?: string;
	clearDecisions: () => void;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isSIHostConnected,
	stakeModes: state.room.stakes.stakeModes,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	clearDecisions: () => {
		dispatch(roomActionCreators.clearDecisions());
	},
});

export function SendPassButton(props: SendPassButtonProps) {
	const appDispatch = useAppDispatch();

	const sendPass2 = () => {
		appDispatch(sendPass());
		appDispatch(setDecisionType(DecisionType.None));
		props.clearDecisions();
	};

	return props.stakeModes & StakeModes.Pass
		? (<button type='button' className={`stake-pass ${props.className}`} disabled={!props.isConnected} onClick={sendPass2}>
			{localization.pass.toUpperCase()}
		</button>)
		: null;
}

export default connect(mapStateToProps, mapDispatchToProps)(SendPassButton);
