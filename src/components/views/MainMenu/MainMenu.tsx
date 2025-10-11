import * as React from 'react';
import localization from '../../../model/resources/localization';
import Dialog from '../../common/Dialog/Dialog';
import GameSound from '../../../model/enums/GameSound';
import { playAudio, stopAudio } from '../../../state/commonSlice';
import Path from '../../../model/enums/Path';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import UserOptions from '../../panels/UserOptions/UserOptions';
import { navigate } from '../../../utils/Navigator';
import { exitApp } from '../../../state/globalActions';
import Link from '../../common/Link/Link';

import './MainMenu.scss';
import twitchImg from '../../../../assets/images/twitch_logo.png';
import boostyImg from '../../../../assets/images/boosty_logo.png';
import patreonImg from '../../../../assets/images/patreon_logo.png';
import steamImg from '../../../../assets/images/steam_logo.png';
import simulatorImg from '../../../../assets/images/simulator_logo.png';

export default function MainMenu(): JSX.Element {
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

	// setTimeout() is to forcibly load window.history before navigating
	const onJoinByPin = () => setTimeout(() => appDispatch(navigate({ navigation: { path: Path.JoinByPin }, saveState: true })), 0);

	const commands = [
		{
			label: localization.joinLobby,
			onClick: () => appDispatch(navigate({ navigation: { path: Path.Lobby }, saveState: true })),
		},
		{
			label: localization.singlePlay,
			onClick: () => appDispatch(navigate({ navigation: { path: Path.NewRoom, newGameMode: 'single' }, saveState: true })),
		},
		{
			label: localization.joinByPin,
			onClick: onJoinByPin,
		},
		{
			label: localization.howToPlay,
			onClick: () => appDispatch(navigate({ navigation: { path: Path.Demo }, saveState: true })),
		},
		{
			label: localization.questionEditor,
			onClick: () => appDispatch(navigate({ navigation: { path: Path.SIQuester }, saveState: true })),
		},
		...(common.exitSupported
			? [
				{
					label: localization.exit,
					onClick: () => appDispatch(exitApp()),
				},
			]
			: []),
	];

	const { steamLinkSupported } = common;

	const links = [
		...(steamLinkSupported ? [{
			href: 'https://store.steampowered.com/app/3553500/SIGame',
			imgSrc: steamImg,
			title: 'Steam',
		}] : []),
		{
			href: 'https://www.twitch.tv/directory/category/sigame',
			imgSrc: twitchImg,
			title: 'Twitch',
		},
		{
			href: 'https://boosty.to/vladimirkhil',
			imgSrc: boostyImg,
			title: 'Boosty',
		},
		{
			href: 'https://patreon.com/vladimirkhil',
			imgSrc: patreonImg,
			title: 'Patreon',
		},
		{
			href: 'https://vladimirkhil.com/si/simulator',
			imgSrc: simulatorImg,
			title: 'SImulator',
		},
	];

	return (
		<section className="welcomeView">
			<header>
				<h1 className='mainHeader'>
					<div className='left'>
						<span className="serverName" title={localization.server}>{common.serverName || localization.appUser}</span>

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
							className='about'
							title={localization.aboutTitle}
							onClick={() => appDispatch(navigate({ navigation: { path: Path.About }, saveState: true }))}
						>
							❔
						</button>
					</div>

					<div className='right'>
						<UserOptions />
					</div>
				</h1>
			</header>

			<div className='mainArea'>
				<div className={common.minimalLogo ? 'logoMini' : 'logo'} />

				<div className='welcomeViewActions'>
					{commands.map((command, index) => (
						<button
							key={index}
							type='button'
							className={`standard welcomeRow ${index % 2 === 0 ? 'left' : 'right'}`}
							onClick={command.onClick}>
							{command.label.toUpperCase()}
						</button>
					))}
				</div>

				{common.proxyAvailable && (
					<div className='proxyHint'>
						📡 {localization.useProxyOnErrors}
					</div>
				)}
			</div>

			{common.clearUrls ? null : <div className='links'>
				<ul>
					{links.map((link, index) => (
						<li key={index}>
							<Link
								href={link.href}
								target='_blank'
								rel='noreferrer noopener'
								title={link.title}
							>
								<img src={link.imgSrc} alt={link.title} />
							</Link>
						</li>
					))}
				</ul>
			</div>}

			{showLicense ? (
				<Dialog className='licenseDialog animated' title={localization.serverLicense} onClose={() => setShowLicense(false)}>
					<div className='licenseText'>
						{common.serverLicense?.split('\n').map((text, index) => <p key={index}>{text}</p>)}
					</div>
				</Dialog>)
				: null}
		</section>
	);
}