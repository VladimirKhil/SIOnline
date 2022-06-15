import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import ChatMode from '../model/enums/ChatMode';
import Chat from './Chat';
import UsersList from './UsersList';
import State from '../state/State';
import localization from '../model/resources/localization';
import actionCreators from '../state/actionCreators';
import LobbyMenu from './LobbyMenu';

import './UsersView.css';

interface UsersViewStateProps {
	chatMode: ChatMode;
	usersCount: number;
	isLobbyChatHidden: boolean;
}

interface UsersViewOwnProps {
	onChatModeChanged: (chatMode: ChatMode) => void;
}

interface UsersViewProps extends UsersViewOwnProps, UsersViewStateProps {

}

const mapStateToProps = (state: State) => ({
	chatMode: state.online.chatMode,
	usersCount: state.online.users.length,
	isLobbyChatHidden: state.settings.isLobbyChatHidden
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onChatModeChanged: (chatMode: ChatMode) => {
		dispatch(actionCreators.chatModeChanged(chatMode));
	},
});

export function UsersView(props: UsersViewProps): JSX.Element | null {
	function chatModeChanged(chatMode: ChatMode) {
		if (props.chatMode !== chatMode) {
			props.onChatModeChanged(chatMode);
		}
	}

	return props.isLobbyChatHidden ? null : (
		<section className="chatHost gamesblock">
			<header>
				<LobbyMenu />
				<div id="chatHostTitle" className="tabHeader">
					<h1
						className={props.chatMode === ChatMode.Chat ? 'activeTab' : ''}
						onClick={() => chatModeChanged(ChatMode.Chat)}
					>
						{localization.chat}
					</h1>
					<h1
						className={`playersTitle ${props.chatMode === ChatMode.Users ? 'activeTab' : ''}`}
						onClick={() => chatModeChanged(ChatMode.Users)}
					>
						<div>
							<span>{localization.users}</span>
							<span> (</span>
							<span>{props.usersCount}</span>
							<span>)</span>
						</div>
					</h1>
				</div>
			</header>

			<div className="chatBody">
				{props.chatMode === ChatMode.Chat ? <Chat /> : <UsersList />}
			</div>
		</section>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(UsersView);
