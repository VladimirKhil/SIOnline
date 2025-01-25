import React from 'react';
import SettingsButton from '../SettingsButton/SettingsButton';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { showProfile } from '../../../state/uiSlice';

import './UserOptions.css';

const UserOptions: React.FC = () => {
	const user = useAppSelector(state => state.user);
	const dispatch = useAppDispatch();

	const userInfo = <div>
		{user.avatar ? <img className='userAvatar' src={user.avatar} alt='Avatar' /> : null}
		<span className='user'>{user.login}</span>
	</div>;

	return (
		<div className='userOptions'>
			<SettingsButton />
			<button type='button' className='userInfo' title={user.login} onClick={() => dispatch(showProfile(true))}>{userInfo}</button>
		</div>
	);
};

export default UserOptions;