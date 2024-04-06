import * as React from 'react';
import { connect } from 'react-redux';
import localization from '../../../model/resources/localization';
import State from '../../../state/State';
import Dialog from '../../common/Dialog';
import GameSound from '../../../model/enums/GameSound';
import commonActionCreators from '../../../state/common/commonActionCreators';
import onlineActionCreators from '../../../state/online/onlineActionCreators';
import Path from '../../../model/enums/Path';
import { Action } from 'redux';
import { INavigationState } from '../../../state/ui/UIState';
import uiActionCreators from '../../../state/ui/uiActionCreators';
import actionCreators from '../../../logic/actionCreators';

import './MainMenu.css';
import exitImg from '../../../../assets/images/exit.png';

interface MainMenuProps {
	isConnected: boolean;
	serverName: string | null;
	serverLicense: string | null;
	windowWidth: number;
	mainMenuSound: boolean;
	userName: string;
	avatar: string | null;

	anyonePlay: () => void;
	onSoundPlay: (sound: GameSound) => void;
	onSoundPause: () => void;
	navigate: (navigation: INavigationState) => void;
	exit: () => void;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isConnected,
	serverName: state.common.serverName,
	serverLicense: state.common.serverLicense,
	windowWidth: state.ui.windowWidth,
	mainMenuSound: state.settings.mainMenuSound,
	userName: state.user.login,
	avatar: state.user.avatar,
});

const mapDispatchToProps = (dispatch: any) => ({
	anyonePlay: () => {
		dispatch(onlineActionCreators.createNewAutoGame());
	},
	onSoundPlay: (sound: GameSound) => {
		dispatch(commonActionCreators.playAudio(sound, true));
	},
	onSoundPause: () => {
		dispatch(commonActionCreators.stopAudio());
	},
	navigate: (navigation: INavigationState) => {
		dispatch(uiActionCreators.navigate(navigation) as unknown as Action); // TODO: fix typing
	},
	exit: () => {
		dispatch(actionCreators.onExit());
	},
});

export function MainMenu(props: MainMenuProps): JSX.Element {
	const [showLicense, setShowLicense] = React.useState(false);

	React.useEffect(() => {
		if (props.mainMenuSound) {
			props.onSoundPlay(GameSound.MAIN_MENU);
			return props.onSoundPause;
		}
	}, []);

	return (
		<section className="welcomeView">
			<header>
				<div className='logo' />

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
						onClick={props.exit}
						title={localization.exitFromGame}>
						<img src={exitImg} alt='Exit' />
					</button>
				</h1>

				<h1>
					{props.avatar ? <img className='userAvatar' src={props.avatar} alt='Avatar' /> : null}
					<span className='user'>{props.userName}</span>
				</h1>
			</header>

			<div className={`welcomeViewActions ${props.isConnected ? '' : 'disconnected'}`}>
				<button
					type='button'
					className='standard welcomeRow right'
					disabled={!props.isConnected} onClick={() => props.navigate({ path: Path.NewRoom, newGameMode: 'single' })}>
					{localization.singlePlay}
				</button>

				<button
					type='button'
					className='standard welcomeRow left'
					disabled={!props.isConnected}
					onClick={() => props.navigate({ path: Path.Rooms })}>
					{localization.friendsPlay}
				</button>

				<button
					type='button'
					className='standard welcomeRow right'
					disabled={!props.isConnected}
					onClick={props.anyonePlay}>
					{localization.anyonePlay}
				</button>

				<button
					type='button'
					className='standard welcomeRow left'
					disabled={!props.isConnected}
					onClick={() => props.navigate({ path: Path.Lobby })}>
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

export default connect(mapStateToProps, mapDispatchToProps)(MainMenu);