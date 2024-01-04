import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import LobbySideMode from '../model/enums/LobbySideMode';
import Chat from './Chat';
import UsersList from './UsersList';
import State from '../state/State';
import localization from '../model/resources/localization';
import onlineActionCreators from '../state/online/onlineActionCreators';
import LobbyMenu from './LobbyMenu';
import Trends from './Trends';

import './UsersView.css';

interface UsersViewStateProps {
	chatMode: LobbySideMode;
	usersCount: number;
	isLobbyChatHidden: boolean;
}

interface UsersViewOwnProps {
	onChatModeChanged: (chatMode: LobbySideMode) => void;
}

interface UsersViewProps extends UsersViewOwnProps, UsersViewStateProps {

}

const mapStateToProps = (state: State) => ({
	chatMode: state.online.chatMode,
	usersCount: state.online.users.length,
	isLobbyChatHidden: state.settings.isLobbyChatHidden
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onChatModeChanged: (chatMode: LobbySideMode) => {
		dispatch(onlineActionCreators.chatModeChanged(chatMode));
	},
});

export function UsersView(props: UsersViewProps): JSX.Element | null {
	function chatModeChanged(chatMode: LobbySideMode) {
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
						className={props.chatMode === LobbySideMode.Trends ? 'activeTab' : ''}
						onClick={() => chatModeChanged(LobbySideMode.Trends)}
					>
						{localization.trends}
					</h1>
					<h1
						className={props.chatMode === LobbySideMode.Chat ? 'activeTab' : ''}
						onClick={() => chatModeChanged(LobbySideMode.Chat)}
					>
						{localization.chat}
					</h1>
					<h1
						className={`playersTitle ${props.chatMode === LobbySideMode.Users ? 'activeTab' : ''}`}
						onClick={() => chatModeChanged(LobbySideMode.Users)}
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
				{props.chatMode === LobbySideMode.Trends
					? <Trends />
					: (props.chatMode === LobbySideMode.Chat ? <Chat /> : <UsersList />)}
			</div>
		</section>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(UsersView);
