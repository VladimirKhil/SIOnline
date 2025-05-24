import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import roomActionCreators from '../../../state/room/roomActionCreators';
import State from '../../../state/State';
import TimerInfo from '../../../model/TimerInfo';
import { isRunning } from '../../../utils/TimerInfoHelpers';

import './ImageContent.css';
import spinnerSvg from '../../../../assets/images/spinner.svg';

interface ImageContentProps {
	uri: string;
	loadTimer: TimerInfo;
	partialImageTime: number;

	mediaLoaded: () => void;
}

const mapStateToProps = (state: State) => ({
	loadTimer: state.table.loadTimer,
	partialImageTime: state.room2.settings.timeSettings.partialImageTime,
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
		const isTimerRunning = isRunning(this.props.loadTimer);
		const animatingClass = isTimerRunning ? ' animate' : '';
		const animationDuration = `${(this.props.loadTimer.maximum - this.props.loadTimer.value) * this.props.partialImageTime}s`;
		const clipPath = `inset(0 0 ${(this.props.loadTimer.maximum - this.props.loadTimer.value) * 100}% 0)`;

		const cropStyle: React.CSSProperties = {
			animationDuration,
			clipPath
		};

		return (
			<div className='image-host'>
				<img alt='spinner' className="spinnerImg" ref={this.spinnerRef} src={spinnerSvg} />
				<img alt='image' className={`inGameImg ${animatingClass}`} style={cropStyle} src={this.props.uri} onLoad={() => this.onImageLoad()} />
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(ImageContent);
