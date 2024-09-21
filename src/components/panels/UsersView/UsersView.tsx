import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import LobbySideMode from '../../../model/enums/LobbySideMode';
import State from '../../../state/State';
import onlineActionCreators from '../../../state/online/onlineActionCreators';
import Trends from '../Trends/Trends';

import './UsersView.css';

interface UsersViewStateProps {
	chatMode: LobbySideMode;
	usersCount: number;
	isLobbyChatHidden: boolean;
	clearUrls?: boolean;
}

interface UsersViewOwnProps {
	onChatModeChanged: (chatMode: LobbySideMode) => void;
}

interface UsersViewProps extends UsersViewOwnProps, UsersViewStateProps {

}

const mapStateToProps = (state: State) => ({
	chatMode: state.online.chatMode,
	usersCount: state.online.users.length,
	isLobbyChatHidden: state.settings.isLobbyChatHidden,
	clearUrls: state.common.clearUrls,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onChatModeChanged: (chatMode: LobbySideMode) => {
		dispatch(onlineActionCreators.chatModeChanged(chatMode));
	},
});

export function UsersView(props: UsersViewProps): JSX.Element | null {
	return props.isLobbyChatHidden ? null : (
		<section className="chatHost gamesblock">
			<div className="chatBody">
				<Trends />
			</div>
		</section>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(UsersView);
