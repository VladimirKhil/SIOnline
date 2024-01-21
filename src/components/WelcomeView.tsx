import * as React from 'react';
import { connect } from 'react-redux';
import localization from '../model/resources/localization';
import actionCreators from '../logic/actionCreators';
import State from '../state/State';
import Dialog from './common/Dialog';
import uiActionCreators from '../state/ui/uiActionCreators';
import onlineActionCreators from '../state/online/onlineActionCreators';
import ServerLicense from './ServerLicense';
import { getCookie, setCookie } from '../utils/CookieHelpers';

import './WelcomeView.css';
import exitImg from '../../assets/images/exit.png';

const ACCEPT_LICENSE_KEY = 'ACCEPT_LICENSE';

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
		dispatch(uiActionCreators.singlePlay());
	},
	friendsPlay: () => {
		dispatch(onlineActionCreators.friendsPlay());
	},
	anyonePlay: () => {
		dispatch(onlineActionCreators.createNewAutoGame());
	},
	joinLobby: () => {
		dispatch(onlineActionCreators.navigateToLobby(-1));
	},
	exit: () => {
		dispatch(actionCreators.onExit());
	}
});

export function WelcomeView(props: WelcomeViewProps): JSX.Element {
	const acceptLicense = getCookie(ACCEPT_LICENSE_KEY);

	const [accepted, setAccepted] = React.useState(acceptLicense !== '');
	const [showLicense, setShowLicense] = React.useState(false);

	function accept() {
		setCookie(ACCEPT_LICENSE_KEY, '1', 365);
		setAccepted(true);
	}

	return !accepted ? <ServerLicense accept={accept} /> : (
		<section className="welcomeView">
			<header>
				<h1>
					<span>{localization.server}</span>
					<span>: </span>
					<span className="serverName">{props.serverName || localization.appUser}</span>

					<button
						type='button'
						className='serverLicense'
						title={localization.serverLicense}
						onClick={() => setShowLicense(true)}
					>
						ⓘ
					</button>

					<button
						type='button'
						className='standard imageButton welcomeExit'
						disabled={!props.isConnected}
						onClick={() => props.exit()}
						title={localization.exitFromGame}>
						<img src={exitImg} alt='Exit' />
					</button>
				</h1>

				<h1>{localization.welcomeTitle}</h1>
			</header>

			<div className={`welcomeViewActions ${props.isConnected ? '' : 'disconnected'}`}>
				<button type='button' className='standard welcomeRow right' disabled={!props.isConnected} onClick={() => props.singlePlay()}>
					{localization.singlePlay}
				</button>

				<button type='button' className='standard welcomeRow left' disabled={!props.isConnected} onClick={() => props.friendsPlay()}>
					{localization.friendsPlay}
				</button>

				<button type='button' className='standard welcomeRow right' disabled={!props.isConnected} onClick={() => props.anyonePlay()}>
					{localization.anyonePlay}
				</button>

				{localization.getLanguage() === 'ru'
					? <button type='button' className='standard welcomeRow left' disabled={!props.isConnected} onClick={() => props.joinLobby()}>
						{localization.joinLobby}
					</button>
					: null}
			</div>

			{showLicense ? (
				<Dialog className='licenseDialog' title={localization.serverLicense} onClose={() => setShowLicense(false)}>
					<div className='licenseText'>
						{props.serverLicense?.split('\n').map((text, index) => <p key={index}>{text}</p>)}
					</div>
				</Dialog>
			)
			: null}
		</section>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(WelcomeView);