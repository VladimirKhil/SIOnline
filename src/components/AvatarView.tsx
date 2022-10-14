import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import Constants from '../model/enums/Constants';
import localization from '../model/resources/localization';
import actionCreators from '../state/actionCreators';
import State from '../state/State';

import './AvatarView.css';

interface AvatarViewProps {
	avatarKey: string | null;
	avatarLoadProgress: boolean;
	onAvatarSelected: (avatar: File) => void;
}

const mapStateToProps = (state: State) => ({
	avatarKey: state.settings.avatarKey,
	avatarLoadProgress: state.common.avatarLoadProgress,
});

const MaxAvatarSizeMb = 2;

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
});

function renderEmpty() {
	return <div className='emptyAvatar' />;
}

function renderAvatar() {
	const base64 = localStorage.getItem(Constants.AVATAR_KEY);

	if (!base64) {
		return renderEmpty();
	}

	return <img className='avatarView' src={`data:image/png;base64, ${base64}`} />;
}

export function AvatarView(props: AvatarViewProps): JSX.Element {
	const inputRef = React.useRef<HTMLInputElement>(null);

	function onAreaClick() {
		const selector = inputRef.current;
	
		if (selector) {
			selector.click();
		}
	}

	return (
		<div className='avatarArea' title={localization.avatar} onClick={onAreaClick}>
			{props.avatarKey ? renderAvatar() : renderEmpty()}

			<input
				ref={inputRef}
				className='avatarSelector'
				type="file"
				accept=".jpg,.jpeg,.png"
				disabled={props.avatarLoadProgress}
				onChange={e => onAvatarChanged(e, props)}
			/>
		</div>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(AvatarView);