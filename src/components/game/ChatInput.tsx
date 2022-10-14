import { connect } from 'react-redux';
import * as React from 'react';
import runActionCreators from '../../state/run/runActionCreators';
import State from '../../state/State';
import { Dispatch, Action } from 'redux';
import Constants from '../../model/enums/Constants';

import './ChatInput.css';

interface ChatInputProps {
	isConnected: boolean;
	message: string;
	onChatMessageChanged: (message : string) => void;
	onChatMessageSend: () => void;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isConnected,
	message: state.run.chat.message
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onChatMessageSend: () => {
		dispatch((runActionCreators.runChatMessageSend() as object) as Action);
	},
	onChatMessageChanged: (message: string) => {
		dispatch(runActionCreators.runChatMessageChanged(message));
	},
});

export function ChatInput(props: ChatInputProps) {
	const onMessageChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
		props.onChatMessageChanged(e.target.value);
	};

	const onMessageKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === Constants.KEY_ENTER_NEW) {
			if (props.isConnected) {
				props.onChatMessageSend();
			}

			e.preventDefault();
		}
	};

	return (
		<input
			className={`gameInputBox gameMessage ${props.isConnected ? '' : 'disconnected'}`}
			value={props.message}
			onChange={onMessageChanged}
			onKeyPress={onMessageKeyPress} />
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatInput);
