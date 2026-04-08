import React from 'react';
import SettingsButton from '../SettingsButton/SettingsButton';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { showProfile } from '../../../state/uiSlice';
import Sex from '../../../model/enums/Sex';

import './UserOptions.css';
import Constants from '../../../model/enums/Constants';

const UserOptions: React.FC = () => {
	const { login, avatar, avatarKey } = useAppSelector(state => ({
		login: state.user.login,
		avatar: state.user.avatar,
		avatarKey: state.settings.avatarKey
	}));

	const dispatch = useAppDispatch();
	const sex = useAppSelector(state => state.settings.sex);

	const effectiveAvatar = React.useMemo(() => {
		if (avatar) {
			return avatar;
		}

		if (typeof localStorage === 'undefined') {
			return null;
		}

		const localAvatar = localStorage.getItem(Constants.AVATAR_KEY);
		return localAvatar ? `data:image/png;base64, ${localAvatar}` : null;
	}, [avatar, avatarKey]);

	const avatarClass = effectiveAvatar ? null : (sex === Sex.Male ? 'avatarMale' : 'avatarFemale');

	const avatarStyle: React.CSSProperties = effectiveAvatar
		? { backgroundImage: `url("${effectiveAvatar}")` }
		: {};

	return (
		<div className='userOptions'>
			<SettingsButton />

			<button type='button' className='userInfo' title={login} onClick={() => dispatch(showProfile(true))}>
				<div className={`userAvatar ${avatarClass}`} style={avatarStyle} title={login} />
			</button>
		</div>
	);
};

export default UserOptions;