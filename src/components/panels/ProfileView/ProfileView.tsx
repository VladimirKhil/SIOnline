import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import State from '../../../state/State';
import localization from '../../../model/resources/localization';
import Dialog from '../../common/Dialog/Dialog';
import roomActionCreators from '../../../state/room/roomActionCreators';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { showProfile } from '../../../state/uiSlice';
import AvatarView from '../AvatarView/AvatarView';
import Path from '../../../model/enums/Path';
import SexView from '../SexView/SexView';
import { changeLogin } from '../../../state/userSlice';

import './ProfileView.scss';

interface ProfileViewProps {
	webCameraUrl: string;
	clearUrls?: boolean;

	onSetWebCamera: (webCameraUrl: string) => void;
	onunsetWebCamera: () => void;
}

const mapStateToProps = (state: State) => ({
	webCameraUrl: state.room.webCameraUrl,
	clearUrls: state.common.clearUrls,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onSetWebCamera: (webCameraUrl: string) => {
		dispatch(roomActionCreators.setWebCamera(webCameraUrl) as any as Action);
	},
	onunsetWebCamera: () => {
		dispatch(roomActionCreators.setWebCamera('') as any as Action);
	},
});

const layout: React.RefObject<HTMLDivElement> = React.createRef();

export function ProfileView(props: ProfileViewProps): JSX.Element {
	const appDispatch = useAppDispatch();
	const [webCameraUrl, setWebCameraUrl] = React.useState(props.webCameraUrl);
	const ui = useAppSelector(state => state.ui);
	const user = useAppSelector(state => state.user);

	const inRoom = 	ui.navigation.path === Path.Room;

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
		appDispatch(changeLogin(e.target.value));
	};

	return (
		<Dialog
			ref={layout}
			className='profile-view'
			title={localization.profile}
			onClose={close}>
			<div className='profile-view__body'>
				<h2>{localization.name}</h2>
				<input aria-label='Name' type='text' className='userName' value={user.login} onChange={onLoginChanged} />

				<h2>{localization.avatar}</h2>
				<AvatarView disabled={false} />

				<h2>{localization.sex}</h2>
				<SexView disabled={false} />

				<h2>{localization.videoAvatar}</h2>

				<div className='option'>
					<label htmlFor='videoUrl'>
						<span>{localization.webCameraUrl} </span>

						{props.clearUrls
							? null
							: <a className='videoSiteUrl' href='https://vdo.ninja' target='_blank' rel='noopener noreferrer'>vdo.ninja</a>}
					</label>

					<input id='videoUrl' className='videoUrl' type='text' value={webCameraUrl} disabled={!inRoom} onChange={onCameraChanged} />

					<div className='buttons'>
						<button
							disabled={!inRoom || webCameraUrl === ''}
							type='button'
							className='standard set'
							onClick={() => props.onSetWebCamera(webCameraUrl)}>
							{localization.set}
						</button>

						<button
							disabled={!inRoom || webCameraUrl === ''}
							type='button'
							className='standard set'
							onClick={() => { props.onunsetWebCamera(); setWebCameraUrl(''); }}>
							{localization.drop}
						</button>
					</div>
				</div>
			</div>
		</Dialog>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfileView);
