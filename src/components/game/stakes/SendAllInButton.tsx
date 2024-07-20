import { connect } from 'react-redux';
import * as React from 'react';
import roomActionCreators from '../../../state/room/roomActionCreators';
import State from '../../../state/State';
import { Dispatch, Action } from 'redux';
import localization from '../../../model/resources/localization';
import { sendAllIn } from '../../../state/new/room2Slice';
import { useAppDispatch } from '../../../state/new/hooks';

interface SendAllInButtonProps {
	isConnected: boolean;
	useSimpleStakes: boolean;
	className?: string;
	clearDecisions: () => void;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isSIHostConnected,
	useSimpleStakes: state.room.stakes.areSimple
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

	return props.useSimpleStakes
		? null
		: (<button type='button' className={props.className} disabled={!props.isConnected} onClick={sendAllIn2}>{localization.allIn}</button>);
}

export default connect(mapStateToProps, mapDispatchToProps)(SendAllInButton);
