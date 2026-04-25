import * as React from 'react';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { onMediaEnded, onMediaLoaded } from '../../../state/serverActions';

import './HtmlContent.css';

interface HtmlContentProps {
	uri: string;
}

interface HtmlContentControlMessage {
	type: 'si:media-control';
	action: 'play' | 'pause';
}

interface HtmlContentEventMessage {
	type: 'si:media-event';
	event: 'completed';
}

export function HtmlContent(props: HtmlContentProps) {
	const { uri } = props;
	const frameRef = React.useRef<HTMLIFrameElement>(null);
	const completedRef = React.useRef(false);
	const appDispatch = useAppDispatch();
	const { isMediaStopped, isVisible } = useAppSelector(state => ({
		isMediaStopped: state.room2.stage.isGamePaused || state.table.isMediaStopped,
		isVisible: state.ui.isVisible,
	}));

	const postControlMessage = React.useCallback((action: HtmlContentControlMessage['action']) => {
		frameRef.current?.contentWindow?.postMessage({
			type: 'si:media-control',
			action,
		} satisfies HtmlContentControlMessage, '*');
	}, []);

	React.useEffect(() => {
		completedRef.current = false;
	}, [uri]);

	React.useEffect(() => {
		const handleMessage = (event: MessageEvent<HtmlContentEventMessage>) => {
			if (event.source !== frameRef.current?.contentWindow) {
				return;
			}

			if (event.data?.type !== 'si:media-event' || event.data.event !== 'completed') {
				return;
			}

			if (completedRef.current || isMediaStopped || !isVisible) {
				return;
			}

			completedRef.current = true;
			appDispatch(onMediaEnded({ contentType: 'html', contentValue: uri }));
		};

		window.addEventListener('message', handleMessage);

		return () => {
			window.removeEventListener('message', handleMessage);
		};
	}, [appDispatch, isMediaStopped, isVisible, uri]);

	React.useEffect(() => {
		if (completedRef.current) {
			return;
		}

		if (isMediaStopped || !isVisible) {
			postControlMessage('pause');
			return;
		}

		postControlMessage('play');
	}, [isMediaStopped, isVisible, postControlMessage]);

	// allow-scripts & allow-same-origin combination is safe until we serve parent and iframe content from different origins
	return <iframe
		ref={frameRef}
		aria-label='HTML content'
		className='frame'
		src={uri}
		allow='autoplay'
		onLoad={() => {
			appDispatch(onMediaLoaded());
			postControlMessage(isMediaStopped || !isVisible ? 'pause' : 'play');
		}}
		sandbox='allow-scripts allow-same-origin allow-presentation' />;
}

export default HtmlContent;
