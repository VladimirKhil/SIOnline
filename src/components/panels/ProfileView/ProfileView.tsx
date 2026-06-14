import * as React from 'react';
import localization from '../../../model/resources/localization';
import GameInfo from '../../../model/GameInfo';
import Dialog from '../../common/Dialog/Dialog';
import TabControl from '../../common/TabControl/TabControl';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { showProfile } from '../../../state/uiSlice';
import AvatarView from '../AvatarView/AvatarView';
import Constants from '../../../model/enums/Constants';
import Path from '../../../model/enums/Path';
import SexView from '../SexView/SexView';
import { changeLogin } from '../../../state/userSlice';
import { userErrorChanged } from '../../../state/commonSlice';
import { validateLoginName } from '../../../utils/loginValidation';
import { setWebCamera } from '../../../state/room2Slice';

import './ProfileView.scss';

const layout: React.RefObject<HTMLDivElement> = React.createRef();
const AccountTab = 0;
const HistoryTab = 1;

function formatResults(results: Record<string, number>): string {
	return Object.entries(results)
		.sort(([, leftScore], [, rightScore]) => rightScore - leftScore)
		.map(([playerName, score]) => `${playerName}: ${score}`)
		.join(', ');
}

function getGameName(game: GameInfo): string {
	if (game.packageName === Constants.RANDOM_PACKAGE) {
		return localization.randomThemes;
	}

	return game.packageName || localization.gameResults;
}

export function ProfileView(): JSX.Element {
	const appDispatch = useAppDispatch();

	const webCamera = useAppSelector(state => state.room2.webCameraUrl);
	const navigation = useAppSelector(state => state.ui.navigation);
	const login = useAppSelector(state => state.user.login);
	const clearUrls = useAppSelector(state => state.common.clearUrls);
	const culture = useAppSelector(state => state.settings.appSettings.culture) || localization.getLanguage();
	const gameHistory = useAppSelector(state => state.history.gameHistory);

	const [webCameraUrl, setWebCameraUrl] = React.useState(webCamera || '');
	const [tempLogin, setTempLogin] = React.useState('');
	const [activeTab, setActiveTab] = React.useState(AccountTab);

	const inRoom = 	navigation.path === Path.Room;

	// Initialize temp login from Redux state
	React.useEffect(() => {
		setTempLogin(login);
	}, [login]);

	const onCameraChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
		setWebCameraUrl(e.target.value);
	};

	const close = () => {
		appDispatch(showProfile(false));
	};

	const hide = (e: Event): void => {
		if (!layout.current || (e.target instanceof Node && layout.current.contains(e.target as Node))) {
			return;
		}

		const avatarMenu = document.querySelector('.avatar-menu');

		if (avatarMenu && avatarMenu.contains(e.target as Node)) {
			return;
		}

		close();
	};

	React.useEffect(() => {
		window.addEventListener('mouseup', hide);

		return () => {
			window.removeEventListener('mouseup', hide);
		};
	}, []);

	const onLoginChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		setTempLogin(newValue);
	};

	const onLoginBlur = () => {
		const validationError = validateLoginName(tempLogin);

		if (validationError) {
			appDispatch(userErrorChanged(validationError));
			// Reset to the last valid value from Redux
			setTempLogin(login);
			return;
		}

		// Only update Redux if valid
		const trimmedLogin = tempLogin.trim();

		// Update Redux with the trimmed valid value
		appDispatch(changeLogin(trimmedLogin));

		// Update local state to match the trimmed value
		setTempLogin(trimmedLogin);
	};

	const displayedHistory = [...gameHistory].reverse();

	return (
		<Dialog
			ref={layout}
			className='profile-view'
			title={localization.profile}
			onClose={close}>
			<div className='profile-view__body'>
				<TabControl
					tabs={[
						{ id: AccountTab, label: localization.info },
						{ id: HistoryTab, label: localization.games },
					]}
					activeTab={activeTab}
					onTabClick={setActiveTab}
				/>

				{activeTab === AccountTab ? (
					<div className='profile-view__tab'>
						<h2>{localization.name}</h2>
						<input
							aria-label='Name'
							type='text'
							className='userName'
							value={tempLogin}
							maxLength={30}
							onChange={onLoginChanged}
							onBlur={onLoginBlur}
						/>

						<h2>{localization.avatar}</h2>
						<AvatarView disabled={false} />

						<h2>{localization.sex}</h2>
						<SexView disabled={false} />

						<h2>{localization.videoAvatar}</h2>

						<div className='option'>
							<label htmlFor='videoUrl'>
								<span>{localization.webCameraUrl} </span>

								{clearUrls
									? null
									: <a className='videoSiteUrl' href='https://vdo.ninja' target='_blank' rel='noopener noreferrer'>vdo.ninja</a>}
							</label>

							<input
								id='videoUrl'
								className='videoUrl'
								type='text'
								value={webCameraUrl}
								disabled={!inRoom}
								onChange={onCameraChanged}
							/>

							<div className='buttons'>
								<button
									disabled={!inRoom || webCameraUrl === ''}
									type='button'
									className='standard set'
									onClick={() => appDispatch(setWebCamera(webCameraUrl))}>
									{localization.set}
								</button>

								<button
									disabled={!inRoom || webCameraUrl === ''}
									type='button'
									className='standard set'
									onClick={() => { appDispatch(setWebCamera('')); }}>
									{localization.drop}
								</button>
							</div>
						</div>
					</div>
				) : (
					<div className='profile-view__tab'>
						{displayedHistory.length > 0 ? (
							<ul className='historyList'>
								{displayedHistory.map((game, index) => (
									<li key={`${game.date}-${index}`} className='historyList__item'>
										<div className='historyList__header'>
											<span className='historyList__title'>{getGameName(game)}</span>
											<span className='historyList__date'>{new Date(game.date).toLocaleDateString(culture)}</span>
										</div>
										<div className='historyList__meta'>{`${localization.showman}: ${game.showman || '-'}`}</div>
										{game.packageAuthors.length > 0 ? (
											<div className='historyList__meta'>
												{`${localization.packageAuthors}: ${game.packageAuthors.join(', ')}`}
											</div>
										) : null}
										<div className='historyList__results'>{`${localization.results}: ${formatResults(game.results) || '-'}`}</div>
									</li>
								))}
							</ul>
						) : (
							<div className='historyEmpty'>{`${localization.games}: 0`}</div>
						)}
					</div>
				)}
			</div>
		</Dialog>
	);
}

export default ProfileView;
