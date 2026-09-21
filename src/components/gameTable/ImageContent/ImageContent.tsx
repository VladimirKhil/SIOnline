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
	const imageRef = React.useRef<HTMLImageElement>(null);
	const [isLoaded, setIsLoaded] = React.useState(false);
	const appDispatch = useAppDispatch();

	const loadTimer = useSelector((state: State) => state.table.loadTimer);
	const partialImageTime = useSelector((state: State) => state.room2.settings.timeSettings.partialImageTime);

	React.useEffect(() => () => {
		if (imageRef.current) {
			imageRef.current.src = '';
		}
	}, []);

	React.useEffect(() => {
		setIsLoaded(false);

		if (spinnerRef.current) {
			spinnerRef.current.style.display = '';
		}
	}, [uri]);

	const handleImageLoad = React.useCallback(() => {
		appDispatch(onMediaLoaded());
		setIsLoaded(true);

		if (!spinnerRef.current) {
			return;
		}

		spinnerRef.current.style.display = 'none';
	}, [appDispatch]);

	const isTimerRunning = isRunning(loadTimer);
	const animatingClass = isTimerRunning ? ' animate' : '';
	const animationDuration = `${(loadTimer.maximum - loadTimer.value) * partialImageTime}s`;
	const clipPath = `inset(0 0 ${(loadTimer.maximum - loadTimer.value) * 100}% 0)`;

	// When several images are displayed one after another, the same img element is reused
	// and the reveal animation would not restart by itself (it has already finished for the previous image).
	// Restart it explicitly so that every image is revealed partially.
	React.useLayoutEffect(() => {
		const image = imageRef.current;

		if (!image || !isTimerRunning) {
			return;
		}

		image.style.animationName = 'none';
		void image.offsetHeight; // forces reflow so that the animation is restarted from the beginning
		image.style.animationName = '';
	}, [uri, isTimerRunning]);

	const cropStyle: React.CSSProperties = {
		animationDuration,
		clipPath,
		WebkitClipPath: clipPath,
		opacity: isLoaded ? 1 : 0,
		transition: 'opacity 0.4s ease-out'
	};

	return (
		<div className='image-host'>
			<img alt='spinner' className="spinnerImg" ref={spinnerRef} src={spinnerSvg} />
			<img alt='image' className={`inGameImg${animatingClass}`} style={cropStyle} ref={imageRef} src={uri} onLoad={handleImageLoad} />
		</div>
	);
};

export default ImageContent;
