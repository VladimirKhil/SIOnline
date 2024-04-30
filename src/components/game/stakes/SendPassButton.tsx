import { connect } from 'react-redux';
import * as React from 'react';
import roomActionCreators from '../../../state/room/roomActionCreators';
import State from '../../../state/State';
import { Dispatch, Action } from 'redux';
import StakeTypes from '../../../model/enums/StakeTypes';
import localization from '../../../model/resources/localization';

interface SendPassButtonProps {
	isConnected: boolean;
	useSimpleStakes: boolean;
	allowedStakeTypes: Record<StakeTypes, boolean>;
	className?: string;
	sendNominal: () => void;
	sendPass: () => void;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isSIHostConnected,
	useSimpleStakes: state.room.stakes.areSimple,
	allowedStakeTypes: state.room.stakes.allowedStakeTypes
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	sendNominal: () => {
		dispatch((roomActionCreators.sendNominal() as object) as Action);
	},
	sendPass: () => {
		dispatch((roomActionCreators.sendPass() as object) as Action);
	}
});

export function SendPassButton(props: SendPassButtonProps) {
	const passStakeHeader = props.allowedStakeTypes[StakeTypes.Nominal] ? localization.nominal : localization.pass;
	const passStakeAction = props.allowedStakeTypes[StakeTypes.Nominal] ? props.sendNominal : props.sendPass;

	return props.useSimpleStakes
		? null
		: (<button className={props.className} disabled={!props.isConnected} onClick={() => passStakeAction()}>{passStakeHeader}</button>);
}

export default connect(mapStateToProps, mapDispatchToProps)(SendPassButton);
