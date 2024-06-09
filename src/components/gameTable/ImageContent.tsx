import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import roomActionCreators from '../../state/room/roomActionCreators';
import State from '../../state/State';

import './ImageContent.css';
import spinnerSvg from '../../../assets/images/spinner.svg';

interface ImageContentProps {
	uri: string;
	contentLoadProgress: number;

	mediaLoaded: () => void;
}

const mapStateToProps = (state: State) => ({
	contentLoadProgress: state.table.contentLoadProgress,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	mediaLoaded: () => {
		dispatch(roomActionCreators.mediaLoaded() as unknown as Action);
	},
});

export class ImageContent extends React.Component<ImageContentProps> {
	private spinnerRef: React.RefObject<HTMLImageElement>;

	constructor(props: ImageContentProps) {
		super(props);

		this.spinnerRef = React.createRef();
	}

	onImageLoad = () => {
		this.props.mediaLoaded();

		if (!this.spinnerRef.current) {
			return;
		}

		this.spinnerRef.current.style.display = 'none';
	};

	render() {
		const clipPath = `inset(0 0 ${(1 - this.props.contentLoadProgress) * 100}% 0)`;

		const cropStyle: React.CSSProperties = {
			clipPath: clipPath
		};

		return (
			<div className='image-host'>
				<img alt='spinner' className="spinnerImg" ref={this.spinnerRef} src={spinnerSvg} />
				<img alt='image' className="inGameImg" style={cropStyle} src={this.props.uri} onLoad={() => this.onImageLoad()} />
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(ImageContent);
