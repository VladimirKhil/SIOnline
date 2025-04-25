import React from 'react';
import SettingsButton from '../SettingsButton/SettingsButton';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { showProfile } from '../../../state/uiSlice';
import Sex from '../../../model/enums/Sex';

import './UserOptions.css';

const UserOptions: React.FC = () => {
	const user = useAppSelector(state => state.user);
	const dispatch = useAppDispatch();
	const sex = useAppSelector(state => state.settings.sex);
	const avatarClass = user.avatar ? null : (sex === Sex.Male ? 'avatarMale' : 'avatarFemale');

	const avatarStyle : React.CSSProperties = user.avatar
		? { backgroundImage: `url("${user.avatar}")` }
		: {};

	return (
		<div className='userOptions'>
			<SettingsButton />

			<button type='button' className='userInfo' title={user.login} onClick={() => dispatch(showProfile(true))}>
				<div className={`userAvatar ${avatarClass}`} style={avatarStyle} title={user.login} />
			</button>
		</div>
	);
};

export default UserOptions;