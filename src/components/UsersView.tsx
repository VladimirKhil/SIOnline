import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import ChatMode from '../model/enums/ChatMode';
import Chat from './Chat';
import UsersList from './UsersList';
import State from '../state/State';
import localization from '../model/resources/localization';
import FlyoutButton, { FlyoutHorizontalOrientation, FlyoutVerticalOrientation } from './common/FlyoutButton';
import actionCreators from '../state/actionCreators';
import LobbyMenu from './LobbyMenu';

import './UsersView.css';

interface UsersViewStateProps {
	chatMode: ChatMode;
	usersCount: number;
}

interface UsersViewOwnProps {
	onChatModeChanged: (chatMode: ChatMode) => void;
	onShowSettings: () => void;
	onHowToPlay: () => void;
	onExit: () => void;
}

interface UsersViewProps extends UsersViewOwnProps, UsersViewStateProps {

}

const mapStateToProps = (state: State) => ({
	chatMode: state.online.chatMode,
	usersCount: state.online.users.length
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onChatModeChanged: (chatMode: ChatMode) => {
		dispatch(actionCreators.chatModeChanged(chatMode));
	},
	onShowSettings: () => {
		dispatch(actionCreators.showSettings(true));
	},
	onHowToPlay: () => {
		dispatch(actionCreators.navigateToHowToPlay());
	},
	onExit: () => {
		dispatch(actionCreators.onExit() as unknown as Action);
	}
});

export function UsersView(props: UsersViewProps): JSX.Element {
	function chatModeChanged(chatMode: ChatMode) {
		if (props.chatMode !== chatMode) {
			props.onChatModeChanged(chatMode);
		}
	}

	return (
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
						<span>{localization.users}</span>
						<span> (</span>
						<span>{props.usersCount}</span>
						<span>)</span>
					</h1>
				</div>
				<FlyoutButton
					className="logOffButton"
					flyout={(
						<ul>
							<li onClick={props.onShowSettings}>{localization.settings}</li>
							<li onClick={props.onHowToPlay}>{localization.aboutTitle}</li>
							<li onClick={props.onExit}>{localization.exit}</li>
						</ul>
					)}
					horizontalOrientation={FlyoutHorizontalOrientation.Left}
					verticalOrientation={FlyoutVerticalOrientation.Bottom}
				>
					<span>⚙</span>
				</FlyoutButton>
			</header>

			<div className="chatBody">
				{props.chatMode === ChatMode.Chat ? <Chat /> : <UsersList />}
			</div>
		</section>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(UsersView);
