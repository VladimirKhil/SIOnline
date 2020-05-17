import * as React from 'react';
import { connect, MapStateToProps, MapDispatchToProps } from 'react-redux';
import ChatMode from '../model/enums/ChatMode';
import Chat from './Chat';
import UsersList from './UsersList';
import State from '../state/State';
import localization from '../model/resources/localization';
import FlyoutButton, { FlyoutHorizontalOrientation, FlyoutVerticalOrientation } from './common/FlyoutButton';
import { Dispatch, Action } from 'redux';
import actionCreators from '../state/actionCreators';
import OnlineMode from '../model/enums/OnlineMode';

import './UsersView.css';

interface UsersViewStateProps {
	chatMode: ChatMode;
	usersCount: number;
}

interface UsersViewOwnProps {
	onChatModeChanged: (chatMode: ChatMode) => void;
	onShowGames: () => void;
	onShowChat: () => void;
	onHowToPlay: () => void;
	onExit: () => void;
}

interface UsersViewProps extends UsersViewOwnProps, UsersViewStateProps {

}

const mapStateToProps = (state: State) => {
	return {
		chatMode: state.online.chatMode,
		usersCount: state.online.users.length
	};
};

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onChatModeChanged: (chatMode: ChatMode) => {
		dispatch(actionCreators.chatModeChanged(chatMode));
	},
	onShowGames: () => {
		dispatch(actionCreators.onOnlineModeChanged(OnlineMode.Games));
	},
	onShowChat: () => {
		dispatch(actionCreators.onOnlineModeChanged(OnlineMode.Chat));
	},
	onHowToPlay: () => {
		dispatch(actionCreators.navigateToHowToPlay());
	},
	onExit: () => {
		dispatch((actionCreators.onExit() as object) as Action);
	}
});

// tslint:disable-next-line: function-name
export function UsersView(props: UsersViewProps) {
	function chatModeChanged(chatMode: ChatMode) {
		if (props.chatMode !== chatMode) {
			props.onChatModeChanged(chatMode);
		}
	}

	return (
		<section className="chatHost gamesblock">
			<header>
				<FlyoutButton className="navButton" flyout={
					<ul>
						<li onClick={props.onShowGames}>{localization.games}</li>
						<li onClick={props.onShowChat}>{localization.chat}</li>
						<li onClick={props.onHowToPlay}>{localization.howToPlay}</li>
						<li onClick={props.onExit}>{localization.exit}</li>
					</ul>
				} horizontalOrientation={FlyoutHorizontalOrientation.Right}
					verticalOrientation={FlyoutVerticalOrientation.Bottom}>☰</FlyoutButton>
				<div id="chatHostTitle" className="tabHeader">
					<h1 id="chatTitle" className={props.chatMode === ChatMode.Chat ? 'activeTab' : ''}
						onClick={() => chatModeChanged(ChatMode.Chat)}>{localization.chat}</h1>
					<h1 id="playersTitle" className={props.chatMode === ChatMode.Users ? 'activeTab' : ''}
						onClick={() => chatModeChanged(ChatMode.Users)}>{localization.users} (<span>{props.usersCount}</span>)</h1>
				</div>
				<FlyoutButton className="logOffButton" flyout={
					<ul>
						<li onClick={props.onHowToPlay}>{localization.howToPlay}</li>
						<li onClick={props.onExit}>{localization.exit}</li>
					</ul>
				} horizontalOrientation={FlyoutHorizontalOrientation.Left}
					verticalOrientation={FlyoutVerticalOrientation.Bottom}>⚙</FlyoutButton>
			</header>

			<div className="chatBody">
				{props.chatMode === ChatMode.Chat ? <Chat /> : <UsersList />}
			</div>
		</section>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(UsersView);
