import * as React from 'react';
import { Action, Dispatch } from 'redux';
import { connect } from 'react-redux';
import State from '../../../state/State';
import localization from '../../../model/resources/localization';
import roomActionCreators from '../../../state/room/roomActionCreators';

import './PassButton.css';

interface PassButtonProps {
	isConnected: boolean;
	windowWidth: number;
	onPass: () => void;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isConnected,
	windowWidth: state.ui.windowWidth,
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
			title={localization.pass}
			disabled={!props.isConnected}
			onClick={() => props.onPass()}
		>
			{props.windowWidth < 600 ? localization.pass : <span>&nbsp;</span> }
		</button>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(PassButton);