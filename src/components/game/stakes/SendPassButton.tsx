import { connect } from 'react-redux';
import * as React from 'react';
import roomActionCreators from '../../../state/room/roomActionCreators';
import State from '../../../state/State';
import { Dispatch, Action } from 'redux';
import StakeTypes from '../../../model/enums/StakeTypes';
import localization from '../../../model/resources/localization';
import { useAppDispatch } from '../../../state/new/hooks';
import { sendNominal, sendPass } from '../../../state/new/room2Slice';

interface SendPassButtonProps {
	isConnected: boolean;
	useSimpleStakes: boolean;
	allowedStakeTypes: Record<StakeTypes, boolean>;
	className?: string;
	clearDecisions: () => void;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isSIHostConnected,
	useSimpleStakes: state.room.stakes.areSimple,
	allowedStakeTypes: state.room.stakes.allowedStakeTypes
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	clearDecisions: () => {
		dispatch(roomActionCreators.clearDecisions());
	},
});

export function SendPassButton(props: SendPassButtonProps) {
	const appDispatch = useAppDispatch();

	const sendNominal2 = () => {
		appDispatch(sendNominal());
		props.clearDecisions();
	};

	const sendPass2 = () => {
		appDispatch(sendPass());
		props.clearDecisions();
	};

	const passStakeHeader = props.allowedStakeTypes[StakeTypes.Nominal] ? localization.nominal : localization.pass;
	const passStakeAction = props.allowedStakeTypes[StakeTypes.Nominal] ? sendNominal2 : sendPass2;

	return props.useSimpleStakes
		? null
		: (<button type='button' className={props.className} disabled={!props.isConnected} onClick={ passStakeAction}>{passStakeHeader}</button>);
}

export default connect(mapStateToProps, mapDispatchToProps)(SendPassButton);
