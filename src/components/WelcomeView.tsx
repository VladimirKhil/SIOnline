import * as React from 'react';
import { connect } from 'react-redux';
import localization from '../model/resources/localization';
import actionCreators from '../state/actionCreators';
import State from '../state/State';

import './WelcomeView.css';

interface WelcomeViewProps {
	isConnected: boolean;
	serverName: string | null;

	singlePlay: () => void;
	friendsPlay: () => void;
	anyonePlay: () => void;
	joinLobby: () => void;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isConnected,
	serverName: state.common.serverName
});

const mapDispatchToProps = (dispatch: any) => ({
	singlePlay: () => {
		dispatch(actionCreators.singlePlay());
	},
	friendsPlay: () => {
		dispatch(actionCreators.friendsPlay());
	},
	anyonePlay: () => {
		dispatch(actionCreators.createNewAutoGame());
	},
	joinLobby: () => {
		dispatch(actionCreators.navigateToLobby(-1));
	}
});

export function WelcomeView(props: WelcomeViewProps): JSX.Element {
	return (
		<section className="welcomeView">
			<header>
				<h1>
					<span>{localization.server}</span>
					<span>: </span>
					<span className="serverName">{props.serverName || localization.appUser}</span>
				</h1>
				<h1>{localization.welcomeTitle}</h1>
			</header>
			<ul className={`welcomeViewActions ${props.isConnected ? '' : 'disconnected'}`}>
				<li onClick={() => (props.isConnected ? props.singlePlay() : null)}>{localization.singlePlay}</li>
				<li onClick={() => (props.isConnected ? props.friendsPlay() : null)}>{localization.friendsPlay}</li>
				<li onClick={() => (props.isConnected ? props.anyonePlay() : null)}>{localization.anyonePlay}</li>
				<li onClick={() => (props.isConnected ? props.joinLobby() : null)}>{localization.joinLobby}</li>
			</ul>
		</section>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(WelcomeView);
