import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import State from '../../../state/State';
import localization from '../../../model/resources/localization';
import Dialog from '../../common/Dialog/Dialog';
import roomActionCreators from '../../../state/room/roomActionCreators';

import './AvatarViewDialog.css';

interface AvatarViewDialogProps {
	webCameraUrl: string;
	clearUrls?: boolean;

	onAvatarClose: () => void;
	onSetWebCamera: (webCameraUrl: string) => void;
	onunsetWebCamera: () => void;
}

const mapStateToProps = (state: State) => ({
	webCameraUrl: state.room.webCameraUrl,
	clearUrls: state.common.clearUrls,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onAvatarClose: () => {
		dispatch(roomActionCreators.avatarVisibleChanged(false));
	},
	onSetWebCamera: (webCameraUrl: string) => {
		dispatch(roomActionCreators.setWebCamera(webCameraUrl) as any as Action);
		dispatch(roomActionCreators.avatarVisibleChanged(false));
	},
	onunsetWebCamera: () => {
		dispatch(roomActionCreators.setWebCamera('') as any as Action);
		dispatch(roomActionCreators.avatarVisibleChanged(false));
	},
});

const layout: React.RefObject<HTMLDivElement> = React.createRef();

export function AvatarViewDialog(props: AvatarViewDialogProps): JSX.Element {
	const [webCameraUrl, setWebCameraUrl] = React.useState(props.webCameraUrl);

	const onCameraChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
		setWebCameraUrl(e.target.value);
	};

	const hide = (e: Event): void => {
		if (!layout.current || (e.target instanceof Node && layout.current.contains(e.target as Node))) {
			return;
		}

		props.onAvatarClose();
	};

	React.useEffect(() => {
		window.addEventListener('mousedown', hide);

		return () => {
			window.removeEventListener('mousedown', hide);
		};
	}, []);

	return (
		<Dialog
			ref={layout}
			className='avatarViewDialog'
			title={localization.avatar}
			onClose={props.onAvatarClose}>
			<div className='option'>
				<label htmlFor='videoUrl'>
					<span>{localization.webCameraUrl} </span>

					{props.clearUrls
						? null
						: <a className='videoSiteUrl' href='https://vdo.ninja' target='_blank' rel='noopener noreferrer'>vdo.ninja</a>}
				</label>

				<input id='videoUrl' type='text' value={webCameraUrl} onChange={onCameraChanged} />

				<div className='buttons'>
					<button
						disabled={webCameraUrl === ''}
						type='button'
						className='set'
						onClick={() => props.onSetWebCamera(webCameraUrl)}>
						{localization.set}
					</button>

					<button
						disabled={webCameraUrl === ''}
						type='button'
						className='set'
						onClick={() => { props.onunsetWebCamera(); setWebCameraUrl(''); }}>
						{localization.drop}
					</button>
				</div>
			</div>
		</Dialog>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(AvatarViewDialog);
