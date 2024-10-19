import * as React from 'react';
import { connect } from 'react-redux';
import localization from '../../../model/resources/localization';
import State from '../../../state/State';
import Dialog from '../../common/Dialog/Dialog';
import GameSound from '../../../model/enums/GameSound';
import { playAudio, stopAudio } from '../../../state/new/commonSlice';
import onlineActionCreators from '../../../state/online/onlineActionCreators';
import Path from '../../../model/enums/Path';
import actionCreators from '../../../logic/actionCreators';
import { AppDispatch } from '../../../state/new/store';
import { useAppDispatch, useAppSelector } from '../../../state/new/hooks';
import Ads from '../../panels/Ads/Ads';
import UserOptions from '../../panels/UserOptions/UserOptions';
import { navigate } from '../../../utils/Navigator';

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

	anyonePlay: (appDispatch: AppDispatch) => void;
	exit: (appDispatch: AppDispatch) => void;
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
	anyonePlay: (appDispatch: AppDispatch) => {
		dispatch(onlineActionCreators.createNewAutoGame(appDispatch));
	},
	exit: (appDispatch: AppDispatch) => {
		dispatch(actionCreators.onExit(appDispatch));
	},
});

export function MainMenu(props: MainMenuProps): JSX.Element {
	const [showLicense, setShowLicense] = React.useState(false);
	const appDispatch = useAppDispatch();
	const common = useAppSelector(state => state.common);

	const stopAudioPlay = () => { appDispatch(stopAudio()); };

	React.useEffect(() => {
		if (props.mainMenuSound) {
			appDispatch(playAudio({ audio: GameSound.MAIN_MENU, loop: true }));
			return stopAudioPlay;
		}
	}, []);

	const onExit = () => props.exit(appDispatch);

	return (
		<section className="welcomeView">
			<header>
				<h1 className='mainHeader'>
					<div className='left'>
						<button
							type='button'
							className='standard imageButton welcomeExit'
							onClick={onExit}
							title={localization.exitFromGame}>
							<img src={exitImg} alt='Exit' />
						</button>

						<span className="serverName" title={localization.server}>{props.serverName || localization.appUser}</span>

						<button
							type='button'
							className='serverLicense'
							title={localization.serverLicense}
							onClick={() => setShowLicense(true)}
						>
							ⓘ
						</button>
					</div>

					<div className='right'>
						<UserOptions />
					</div>
				</h1>
			</header>

			<div className='mainArea'>
				<div className={common.clearUrls ? 'logoMini' : 'logo'} />

				<div className={`welcomeViewActions ${props.isConnected ? '' : 'disconnected'}`}>
					<button
						type='button'
						className='standard welcomeRow right'
						disabled={!props.isConnected}
						onClick={() => appDispatch(navigate({ navigation: { path: Path.NewRoom, newGameMode: 'single' }, saveState: true }))}>
						{localization.singlePlay}
					</button>

					<button
						type='button'
						className='standard welcomeRow left'
						disabled={!props.isConnected}
						onClick={() => props.anyonePlay(appDispatch)}>
						{localization.anyonePlay}
					</button>

					<button
						type='button'
						className='standard welcomeRow right'
						disabled={!props.isConnected}
						onClick={() => appDispatch(navigate({ navigation: { path: Path.JoinByPin }, saveState: true }))}>
						{localization.joinByPin}
					</button>

					<button
						type='button'
						className='standard welcomeRow left'
						disabled={!props.isConnected}
						onClick={() => appDispatch(navigate({ navigation: { path: Path.Lobby }, saveState: true }))}>
						{localization.joinLobby}
					</button>
				</div>

				<Ads />
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