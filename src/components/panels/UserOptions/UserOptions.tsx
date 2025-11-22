import React from 'react';
import SettingsButton from '../SettingsButton/SettingsButton';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { showProfile } from '../../../state/uiSlice';
import Sex from '../../../model/enums/Sex';

import './UserOptions.css';

const UserOptions: React.FC = () => {
	const { login, avatar } = useAppSelector(state => ({
		login: state.user.login,
		avatar: state.user.avatar
	}));

	const dispatch = useAppDispatch();
	const sex = useAppSelector(state => state.settings.sex);
	const avatarClass = avatar ? null : (sex === Sex.Male ? 'avatarMale' : 'avatarFemale');

	const avatarStyle : React.CSSProperties = avatar
		? { backgroundImage: `url("${avatar}")` }
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