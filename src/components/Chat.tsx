import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import State from '../state/State';
import Constants from '../model/enums/Constants';
import actionCreators from '../state/actionCreators';
import ChatMessage from '../model/ChatMessage';
import ChatLog from './common/ChatLog';

import './Chat.css';

interface ChatOwnProps {
	isConnected: boolean;
	onMessageChanged: (value: string) => void;
	onSendMessage: () => void;
}

interface ChatStateProps {
	currentMessage: string;
	messages: ChatMessage[];
}

interface ChatProps extends ChatStateProps, ChatOwnProps {

}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isConnected,
	currentMessage: state.online.currentMessage,
	messages: state.online.messages
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onMessageChanged: (value: string) => {
		dispatch(actionCreators.messageChanged(value));
	},
	onSendMessage: () => {
		dispatch((actionCreators.sendMessage() as object) as Action);
	}
});

export function Chat(props: ChatProps): JSX.Element {
	const onMessageChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
		props.onMessageChanged(e.target.value);
	};

	const onMessageKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === Constants.KEY_ENTER_NEW) {
			if (props.isConnected) {
				props.onSendMessage();
			}

			e.preventDefault();
		}
	};

	return (
		<div className="chatBodyHost">
			<ChatLog className="chat" messages={props.messages} />

			<input
				type='text'
				className={`message ${props.isConnected ? '' : 'disconnected'}`}
				value={props.currentMessage}
				onChange={onMessageChanged}
				onKeyPress={onMessageKeyPress}
			/>
		</div>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(Chat);
