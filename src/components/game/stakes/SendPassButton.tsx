import { connect } from 'react-redux';
import * as React from 'react';
import runActionCreators from '../../../state/run/runActionCreators';
import State from '../../../state/State';
import { Dispatch, Action } from 'redux';
import StakeTypes from '../../../model/enums/StakeTypes';
import localization from '../../../model/resources/localization';

interface SendPassButtonProps {
	isConnected: boolean;
	useSimpleStakes: boolean;
	allowedStakeTypes: Record<StakeTypes, boolean>;
	sendNominal: () => void;
	sendPass: () => void;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isConnected,
	useSimpleStakes: state.run.stakes.areSimple,
	allowedStakeTypes: state.run.stakes.allowedStakeTypes
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	sendNominal: () => {
		dispatch((runActionCreators.sendNominal() as object) as Action);
	},
	sendPass: () => {
		dispatch((runActionCreators.sendPass() as object) as Action);
	}
});

// tslint:disable-next-line: function-name
export function SendPassButton(props: SendPassButtonProps) {
	const passStakeHeader = props.allowedStakeTypes[StakeTypes.Nominal] ? localization.nominal : localization.pass;
	const passStakeAction = props.allowedStakeTypes[StakeTypes.Nominal] ? props.sendNominal : props.sendPass;

	return props.useSimpleStakes ? null : (<button disabled={!props.isConnected} onClick={() => passStakeAction()}>{passStakeHeader}</button>);
}

export default connect(mapStateToProps, mapDispatchToProps)(SendPassButton);
