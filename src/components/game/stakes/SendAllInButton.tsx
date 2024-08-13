import { connect } from 'react-redux';
import * as React from 'react';
import roomActionCreators from '../../../state/room/roomActionCreators';
import State from '../../../state/State';
import { Dispatch, Action } from 'redux';
import localization from '../../../model/resources/localization';
import { sendAllIn } from '../../../state/new/room2Slice';
import { useAppDispatch } from '../../../state/new/hooks';
import StakeModes from '../../../client/game/StakeModes';

interface SendAllInButtonProps {
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

export function SendAllInButton(props: SendAllInButtonProps) {
	const appDispatch = useAppDispatch();

	const sendAllIn2 = () => {
		appDispatch(sendAllIn());
		props.clearDecisions();
	};

	return props.stakeModes & StakeModes.AllIn
		? (<button type='button' className={props.className} disabled={!props.isConnected} onClick={sendAllIn2}>{localization.allIn}</button>)
		: null;
}

export default connect(mapStateToProps, mapDispatchToProps)(SendAllInButton);
