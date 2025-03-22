import * as React from 'react';
import { connect } from 'react-redux';
import localization from '../../../model/resources/localization';
import Dialog from '../../common/Dialog/Dialog';
import GameSound from '../../../model/enums/GameSound';
import { playAudio, stopAudio } from '../../../state/commonSlice';
import onlineActionCreators from '../../../state/online/onlineActionCreators';
import Path from '../../../model/enums/Path';
import { AppDispatch } from '../../../state/store';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import UserOptions from '../../panels/UserOptions/UserOptions';
import { navigate } from '../../../utils/Navigator';
import { exitApp } from '../../../state/globalActions';

import './MainMenu.scss';
import exitImg from '../../../../assets/images/exit.png';
import twitchImg from '../../../../assets/images/twitch_logo.png';
import boostyImg from '../../../../assets/images/boosty_logo.png';
import patreonImg from '../../../../assets/images/patreon_logo.png';
import steamImg from '../../../../assets/images/steam_logo.png';
import simulatorImg from '../../../../assets/images/simulator_logo.png';

interface MainMenuProps {
	anyonePlay: (appDispatch: AppDispatch) => void;
}

const mapDispatchToProps = (dispatch: any) => ({
	anyonePlay: (appDispatch: AppDispatch) => {
		dispatch(onlineActionCreators.createNewAutoGame(appDispatch));
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

	const onExit = () => {
		appDispatch(navigate({ navigation: { path: Path.Login }, saveState: true }));
	};

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

				<div className='welcomeViewActions'>
					<button
						type='button'
						className='standard welcomeRow right'
						onClick={() => appDispatch(navigate({ navigation: { path: Path.Lobby }, saveState: true }))}>
						{localization.joinLobby.toUpperCase()}
					</button>

					<button
						type='button'
						className='standard welcomeRow left'
						onClick={() => appDispatch(navigate({ navigation: { path: Path.NewRoom, newGameMode: 'single' }, saveState: true }))}>
						{localization.singlePlay.toUpperCase()}
					</button>

					<button
						type='button'
						className='standard welcomeRow right'
						onClick={() => props.anyonePlay(appDispatch)}>
						{localization.anyonePlay.toUpperCase()}
					</button>

					<button
						type='button'
						className='standard welcomeRow left'
						onClick={onJoinByPin}>
						{localization.joinByPin.toUpperCase()}
					</button>

					<button
						type='button'
						className='standard welcomeRow right'
						onClick={() => appDispatch(navigate({ navigation: { path: Path.SIQuester }, saveState: true }))}>
						{localization.questionEditor.toUpperCase()}
					</button>

					{common.exitSupported ? (
						<button
							type='button'
							className='standard welcomeRow right'
							onClick={() => appDispatch(exitApp())}>
							{localization.exit.toUpperCase()}
						</button>
					) : null}
				</div>
			</div>

			{common.clearUrls ? null : <div className='links'>
				<ul>
					<li>
						<a href='https://store.steampowered.com/app/3553500/SIGame' target='_blank' rel='noreferrer noopener' title='Steam'>
							<img src={steamImg} alt='Steam' />
						</a>
					</li>

					<li>
						<a href='https://www.twitch.tv/directory/category/sigame' target='_blank' rel='noreferrer noopener' title='Twitch'>
							<img src={twitchImg} alt='Twitch' />
						</a>
					</li>

					<li>
						<a href='https://boosty.to/vladimirkhil' target='_blank' rel='noreferrer noopener' title='Boosty'>
							<img src={boostyImg} alt='Boosty' />
						</a>
					</li>

					<li>
						<a href='https://patreon.com/vladimirkhil' target='_blank' rel='noreferrer noopener' title='Patreon'>
							<img src={patreonImg} alt='Patreon' />
						</a>
					</li>

					<li>
						<a href='https://vladimirkhil.com/si/simulator' target='_blank' rel='noreferrer noopener' title='SImulator'>
							<img src={simulatorImg} alt='SImulator' />
						</a>
					</li>
				</ul>
			</div>}

			{showLicense ? (
				<Dialog className='licenseDialog animated' title={localization.serverLicense} onClose={() => setShowLicense(false)}>
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