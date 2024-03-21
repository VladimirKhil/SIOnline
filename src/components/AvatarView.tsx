import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import Constants from '../model/enums/Constants';
import localization from '../model/resources/localization';
import actionCreators from '../logic/actionCreators';
import State from '../state/State';
import FlyoutButton from './common/FlyoutButton';

import './AvatarView.css';

interface AvatarViewProps {
	avatarKey: string | null;
	avatarLoadProgress: boolean;
	disabled: boolean | undefined;

	onAvatarSelected: (avatar: File) => void;
	onAvatarDeleted: () => void;
}

const mapStateToProps = (state: State) => ({
	avatarKey: state.settings.avatarKey,
	avatarLoadProgress: state.common.avatarLoadProgress,
});

const MaxAvatarSizeMb = 1;

function onAvatarChanged(e: React.ChangeEvent<HTMLInputElement>, props: AvatarViewProps) {
	if (e.target.files && e.target.files.length > 0) {
		// eslint-disable-next-line prefer-destructuring
		const targetFile = e.target.files[0];

		if (targetFile.size > MaxAvatarSizeMb * 1024 * 1024) {
			alert(`${localization.avatarIsTooBig} (${MaxAvatarSizeMb} MB)`);
			return;
		}

		props.onAvatarSelected(targetFile);
	}
}

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onAvatarSelected: (avatar: File) => {
		dispatch(actionCreators.onAvatarSelectedLocal(avatar) as any);
	},
	onAvatarDeleted: () => {
		dispatch(actionCreators.onAvatarDeleted() as any);
	},
});

function renderEmpty() {
	return <div className='emptyAvatar' />;
}

function renderAvatar() {
	const base64 = localStorage.getItem(Constants.AVATAR_KEY);

	if (!base64) {
		return renderEmpty();
	}

	return <img className='avatarView' alt='user avatar' src={`data:image/png;base64, ${base64}`} />;
}

export function AvatarView(props: AvatarViewProps): JSX.Element {
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
							<li onClick={props.onAvatarDeleted}>{localization.deleteAvatar}</li>
						</ul>
					}>
					{renderAvatar()}
				</FlyoutButton>) : (
				<div className={`avatarArea ${props.disabled ? 'unselectable' : ''}`} title={localization.selectAvatar} onClick={onAreaClick}>
					{renderEmpty()}
				</div>
			)}

			<input
				ref={inputRef}
				className='avatarSelector'
				type="file"
				accept=".jpg,.jpeg,.png"
				aria-label='Avatar selector'
				disabled={props.avatarLoadProgress}
				onChange={e => onAvatarChanged(e, props)}
			/>
		</>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(AvatarView);