import * as React from 'react';
import { Action, Dispatch } from 'redux';
import { connect } from 'react-redux';
import State from '../../../state/State';
import localization from '../../../model/resources/localization';
import roomActionCreators from '../../../state/room/roomActionCreators';

import './PassButton.css';

interface PassButtonProps {
	isConnected: boolean;
	onPass: () => void;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isSIHostConnected,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onPass: () => {
		dispatch(roomActionCreators.onPass() as unknown as Action);
	},
});

export function PassButton(props: PassButtonProps): JSX.Element | null {
	return (
		<button
			type="button"
			className='passButton'
			disabled={!props.isConnected}
			onClick={() => props.onPass()}
		>
			{localization.pass.toLocaleUpperCase()}
		</button>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(PassButton);