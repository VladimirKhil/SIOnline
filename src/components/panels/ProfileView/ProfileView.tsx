import * as React from 'react';
import localization from '../../../model/resources/localization';
import Dialog from '../../common/Dialog/Dialog';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { showProfile } from '../../../state/uiSlice';
import AvatarView from '../AvatarView/AvatarView';
import Path from '../../../model/enums/Path';
import SexView from '../SexView/SexView';
import { changeLogin } from '../../../state/userSlice';
import { userErrorChanged } from '../../../state/commonSlice';
import { validateLoginName } from '../../../utils/loginValidation';
import { setWebCamera } from '../../../state/room2Slice';

import './ProfileView.scss';

const layout: React.RefObject<HTMLDivElement> = React.createRef();

export function ProfileView(): JSX.Element {
	const appDispatch = useAppDispatch();

	const webCamera = useAppSelector(state => state.room2.webCameraUrl);
	const navigation = useAppSelector(state => state.ui.navigation);
	const login = useAppSelector(state => state.user.login);
	const clearUrls = useAppSelector(state => state.common.clearUrls);

	const [webCameraUrl, setWebCameraUrl] = React.useState(webCamera || '');
	const [tempLogin, setTempLogin] = React.useState('');

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

	return (
		<Dialog
			ref={layout}
			className='profile-view'
			title={localization.profile}
			onClose={close}>
			<div className='profile-view__body'>
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

					<input id='videoUrl' className='videoUrl' type='text' value={webCameraUrl} disabled={!inRoom} onChange={onCameraChanged} />

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
		</Dialog>
	);
}

export default ProfileView;
