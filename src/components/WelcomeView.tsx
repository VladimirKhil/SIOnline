import * as React from 'react';
import { connect } from 'react-redux';
import localization from '../model/resources/localization';
import State from '../state/State';
import Dialog from './common/Dialog';
import ServerLicense from './ServerLicense';
import { getCookie, setCookie } from '../utils/CookieHelpers';
import GameSound from '../model/enums/GameSound';
import commonActionCreators from '../state/common/commonActionCreators';
import { useNavigate } from 'react-router-dom';
import onlineActionCreators from '../state/online/onlineActionCreators';
import Path from '../model/enums/Path';

import './WelcomeView.css';
import exitImg from '../../assets/images/exit.png';

const ACCEPT_LICENSE_KEY = 'ACCEPT_LICENSE';

interface WelcomeViewProps {
	isConnected: boolean;
	serverName: string | null;
	serverLicense: string | null;
	windowWidth: number;
	mainMenuSound: boolean;

	anyonePlay: (callback: (gameId: number) => void) => void;
	onSoundPlay: (sound: GameSound) => void;
	onSoundPause: () => void;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isConnected,
	serverName: state.common.serverName,
	serverLicense: state.common.serverLicense,
	windowWidth: state.ui.windowWidth,
	mainMenuSound: state.settings.mainMenuSound,
});

const mapDispatchToProps = (dispatch: any) => ({
	anyonePlay: (callback: (gameId: number) => void) => {
		dispatch(onlineActionCreators.createNewAutoGame(callback));
	},
	onSoundPlay: (sound: GameSound) => {
		dispatch(commonActionCreators.playAudio(sound, true));
	},
	onSoundPause: () => {
		dispatch(commonActionCreators.stopAudio());
	},
});

export function WelcomeView(props: WelcomeViewProps): JSX.Element {
	const navigate = useNavigate();

	const acceptLicense = getCookie(ACCEPT_LICENSE_KEY);

	const [accepted, setAccepted] = React.useState(acceptLicense !== '');
	const [showLicense, setShowLicense] = React.useState(false);

	function accept() {
		setCookie(ACCEPT_LICENSE_KEY, '1', 365);
		setAccepted(true);
	}

	React.useEffect(() => {
		if (props.mainMenuSound) {
			props.onSoundPlay(GameSound.MAIN_MENU);
			return props.onSoundPause;
		}
	}, []);

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
						onClick={() => navigate(Path.Logout) }
						title={localization.exitFromGame}>
						<img src={exitImg} alt='Exit' />
					</button>
				</h1>

				<h1>{localization.welcomeTitle}</h1>
			</header>

			<div className={`welcomeViewActions ${props.isConnected ? '' : 'disconnected'}`}>
				<button
					type='button'
					className='standard welcomeRow right'
					disabled={!props.isConnected} onClick={() => navigate(Path.NewRoom, { state: { mode: 'single' } })}>
					{localization.singlePlay}
				</button>

				<button type='button' className='standard welcomeRow left' disabled={!props.isConnected} onClick={() => navigate(Path.Rooms)}>
					{localization.friendsPlay}
				</button>

				<button
					type='button'
					className='standard welcomeRow right'
					disabled={!props.isConnected}
					onClick={() => props.anyonePlay((gameId) => navigate(Path.Room + '?gameId=' + gameId))}>
					{localization.anyonePlay}
				</button>

				<button type='button' className='standard welcomeRow left' disabled={!props.isConnected} onClick={() => navigate(Path.Lobby)}>
					{localization.joinLobby}
				</button>
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