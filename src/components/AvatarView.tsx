import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import Constants from '../model/enums/Constants';
import localization from '../model/resources/localization';
import actionCreators from '../logic/actionCreators';
import State from '../state/State';
import FlyoutButton from './common/FlyoutButton';
import commonActionCreators from '../state/common/commonActionCreators';
import { useAppDispatch, useAppSelector } from '../state/new/hooks';
import { setAvatarKey } from '../state/new/settingsSlice';
import { AppDispatch } from '../state/new/store';
import Sex from '../model/enums/Sex';

import './AvatarView.css';

interface AvatarViewProps {
	avatarKey: string | null;
	avatarLoadProgress: boolean;
	disabled: boolean | undefined;

	onAvatarSelected: (avatar: File, appDispatch: AppDispatch) => void;
	onUserError: (error: string) => void;
}

const mapStateToProps = (state: State) => ({
	avatarKey: state.settings.avatarKey,
	avatarLoadProgress: state.common.avatarLoadProgress,
});

const MaxAvatarSizeMb = 1;

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onAvatarSelected: (avatar: File, appDispatch: AppDispatch) => {
		dispatch(actionCreators.onAvatarSelectedLocal(avatar, appDispatch) as any);
	},
	onUserError: (error: string) => {
		dispatch(commonActionCreators.onUserError(error) as any);
	}
});

function renderEmpty(sex: Sex) {
	return <div className={`emptyAvatar ${sex === Sex.Male ? 'avatarMale' : 'avatarFemale'}`} />;
}

function renderAvatar(sex: Sex) {
	const base64 = localStorage.getItem(Constants.AVATAR_KEY);

	if (!base64) {
		return renderEmpty(sex);
	}

	return <img className='avatarView' alt='user avatar' src={`data:image/png;base64, ${base64}`} />;
}

export function AvatarView(props: AvatarViewProps): JSX.Element {
	const sex = useAppSelector(state => state.settings.sex);
	const appDispatch = useAppDispatch();
	const inputRef = React.useRef<HTMLInputElement>(null);

	function onAreaClick() {
		if (props.disabled) {
			return;
		}

		const selector = inputRef.current;

		if (selector) {
			selector.click();
		}
	}

	function onAvatarDeleted() {
		if (props.disabled) {
			return;
		}

		localStorage.removeItem(Constants.AVATAR_KEY);
		localStorage.removeItem(Constants.AVATAR_NAME_KEY);
		appDispatch(setAvatarKey(''));
	}

	function onAvatarChanged(e: React.ChangeEvent<HTMLInputElement>) {
		if (e.target.files && e.target.files.length > 0) {
			// eslint-disable-next-line prefer-destructuring
			const targetFile = e.target.files[0];

			if (targetFile.size > MaxAvatarSizeMb * 1024 * 1024) {
				props.onUserError(`${localization.avatarIsTooBig} (${MaxAvatarSizeMb} MB)`);
				return;
			}

			props.onAvatarSelected(targetFile, appDispatch);
		}
	}

	return (
		<>
			{props.avatarKey ? (
				<FlyoutButton
					disabled={props.disabled}
					className={`avatarArea ${props.disabled ? 'unselectable' : ''}`}
					title={localization.selectAvatar}
					flyout={
						<ul>
							<li onClick={onAreaClick}>{localization.selectAvatar}</li>
							<li onClick={onAvatarDeleted}>{localization.deleteAvatar}</li>
						</ul>
					}>
					{renderAvatar(sex)}
				</FlyoutButton>) : (
				<div className={`avatarArea ${props.disabled ? 'unselectable' : ''}`} title={localization.selectAvatar} onClick={onAreaClick}>
					{renderEmpty(sex)}
				</div>
			)}

			<input
				ref={inputRef}
				className='avatarSelector'
				type="file"
				accept=".jpg,.jpeg,.png"
				aria-label='Avatar selector'
				disabled={props.avatarLoadProgress}
				onChange={onAvatarChanged}
			/>
		</>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(AvatarView);