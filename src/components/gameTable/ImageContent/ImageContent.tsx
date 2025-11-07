import * as React from 'react';
import { useSelector } from 'react-redux';
import State from '../../../state/State';
import { isRunning } from '../../../utils/TimerInfoHelpers';
import { useAppDispatch } from '../../../state/hooks';
import { onMediaLoaded } from '../../../state/serverActions';

import './ImageContent.css';
import spinnerSvg from '../../../../assets/images/spinner.svg';

interface ImageContentProps {
	uri: string;
}

const ImageContent: React.FC<ImageContentProps> = ({ uri }) => {
	const spinnerRef = React.useRef<HTMLImageElement>(null);
	const appDispatch = useAppDispatch();

	const loadTimer = useSelector((state: State) => state.table.loadTimer);
	const partialImageTime = useSelector((state: State) => state.room2.settings.timeSettings.partialImageTime);

	const handleImageLoad = React.useCallback(() => {
		appDispatch(onMediaLoaded());

		if (!spinnerRef.current) {
			return;
		}

		spinnerRef.current.style.display = 'none';
	}, [appDispatch]);

	const isTimerRunning = isRunning(loadTimer);
	const animatingClass = isTimerRunning ? ' animate' : '';
	const animationDuration = `${(loadTimer.maximum - loadTimer.value) * partialImageTime}s`;
	const clipPath = `inset(0 0 ${(loadTimer.maximum - loadTimer.value) * 100}% 0)`;

	const cropStyle: React.CSSProperties = {
		animationDuration,
		clipPath
	};

	return (
		<div className='image-host'>
			<img alt='spinner' className="spinnerImg" ref={spinnerRef} src={spinnerSvg} />
			<img alt='image' className={`inGameImg ${animatingClass}`} style={cropStyle} src={uri} onLoad={handleImageLoad} />
		</div>
	);
};

export default ImageContent;
