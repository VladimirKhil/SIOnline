import * as React from 'react';
import { connect } from 'react-redux';
import localization from '../../../model/resources/localization';
import Dialog from '../../common/Dialog/Dialog';
import GameSound from '../../../model/enums/GameSound';
import { playAudio, stopAudio } from '../../../state/commonSlice';
import onlineActionCreators from '../../../state/online/onlineActionCreators';
import Path from '../../../model/enums/Path';
import actionCreators from '../../../logic/actionCreators';
import { AppDispatch } from '../../../state/store';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import Ads from '../../panels/Ads/Ads';
import UserOptions from '../../panels/UserOptions/UserOptions';
import { navigate } from '../../../utils/Navigator';

import './MainMenu.css';
import exitImg from '../../../../assets/images/exit.png';

interface MainMenuProps {
	anyonePlay: (appDispatch: AppDispatch) => void;
	exit: (appDispatch: AppDispatch) => void;
}

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
	const settings = useAppSelector(state => state.settings);

	const stopAudioPlay = () => { appDispatch(stopAudio()); };

	React.useEffect(() => {
		if (settings.mainMenuSound) {
			appDispatch(playAudio({ audio: GameSound.MAIN_MENU, loop: true }));
			return stopAudioPlay;
		}
	}, []);

	const onExit = () => props.exit(appDispatch);

	// setTimeout() is to forcibly load window.history before navigating
	const onJoinByPin = () => setTimeout(() => appDispatch(navigate({ navigation: { path: Path.JoinByPin }, saveState: true })), 0);

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

						<span className="serverName" title={localization.server}>{common.serverName || localization.appUser}</span>

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

				<div className={`welcomeViewActions ${common.isConnected ? '' : 'disconnected'}`}>
					<button
						type='button'
						className='standard welcomeRow right'
						disabled={!common.isConnected}
						onClick={() => appDispatch(navigate({ navigation: { path: Path.NewRoom, newGameMode: 'single' }, saveState: true }))}>
						{localization.singlePlay.toUpperCase()}
					</button>

					<button
						type='button'
						className='standard welcomeRow left'
						disabled={!common.isConnected}
						onClick={() => props.anyonePlay(appDispatch)}>
						{localization.anyonePlay.toUpperCase()}
					</button>

					<button
						type='button'
						className='standard welcomeRow right'
						disabled={!common.isConnected}
						onClick={onJoinByPin}>
						{localization.joinByPin.toUpperCase()}
					</button>

					<button
						type='button'
						className='standard welcomeRow left'
						disabled={!common.isConnected}
						onClick={() => appDispatch(navigate({ navigation: { path: Path.Lobby }, saveState: true }))}>
						{localization.joinLobby.toUpperCase()}
					</button>
				</div>

				<Ads />
			</div>

			{showLicense ? (
				<Dialog className='licenseDialog' title={localization.serverLicense} onClose={() => setShowLicense(false)}>
					<div className='licenseText'>
						{common.serverLicense?.split('\n').map((text, index) => <p key={index}>{text}</p>)}
					</div>
				</Dialog>
			)
			: null}
		</section>
	);
}

export default connect(null, mapDispatchToProps)(MainMenu);