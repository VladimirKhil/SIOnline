import * as React from 'react';
import { connect } from 'react-redux';
import localization from '../model/resources/localization';
import actionCreators from '../state/actionCreators';
import State from '../state/State';
import FlyoutButton, { FlyoutHorizontalOrientation } from './common/FlyoutButton';

import './WelcomeView.css';

interface WelcomeViewProps {
	isConnected: boolean;
	serverName: string | null;
	serverLicense: string | null;
	windowWidth: number;

	singlePlay: () => void;
	friendsPlay: () => void;
	anyonePlay: () => void;
	joinLobby: () => void;
	exit: () => void;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isConnected,
	serverName: state.common.serverName,
	serverLicense: state.common.serverLicense,
	windowWidth: state.ui.windowWidth
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
	},
	exit: () => {
		dispatch(actionCreators.onExit());
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
					<FlyoutButton
						className='serverLicense'
						title={localization.serverLicense}
						flyout={<span className='licenseText'>
							<header>{localization.serverLicense}</header>
							{props.serverLicense?.split('\n').map((text, index) => <p key={index}>{text}</p>)}
							</span>}
						horizontalOrientation={props.windowWidth < 800 ? FlyoutHorizontalOrientation.Left : FlyoutHorizontalOrientation.Right}
					>
						ⓘ
					</FlyoutButton>
				</h1>
				<h1>{localization.welcomeTitle}</h1>
			</header>
			<div className={`welcomeViewActions ${props.isConnected ? '' : 'disconnected'}`}>
				<button className='standard welcomeRow right' disabled={!props.isConnected} onClick={() => props.singlePlay()}>
					{localization.singlePlay}
				</button>

				<button className='standard welcomeRow left' disabled={!props.isConnected} onClick={() => props.friendsPlay()}>
					{localization.friendsPlay}
				</button>
				
				<button className='standard welcomeRow right' disabled={!props.isConnected} onClick={() => props.anyonePlay()}>
					{localization.anyonePlay}
				</button>
				
				<button className='standard welcomeRow left' disabled={!props.isConnected} onClick={() => props.joinLobby()}>
					{localization.joinLobby}
				</button>
				
				<button className='standard welcomeRow right' disabled={!props.isConnected} onClick={() => props.exit()}>
					{localization.exitFromGame}
				</button>
			</div>
		</section>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(WelcomeView);
