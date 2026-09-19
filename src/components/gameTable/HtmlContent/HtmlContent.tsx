import * as React from 'react';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import {
	registerCooperativeHtmlVolumeSupport,
	unregisterCooperativeHtmlVolumeSupport,
} from '../../../state/tableSlice';
import {
	onMediaEnded,
	onMediaLoaded,
	sendAnswerAsRightByDefault,
	sendAnswerAsWrongByDefault,
} from '../../../state/serverActions';
import { DecisionType } from '../../../state/room2Slice';
import Role from '../../../model/Role';
import { getMeAsPlayer } from '../../../utils/StateHelpers';

import './HtmlContent.css';

interface HtmlContentProps {
	uri: string;
}

/** Role of the local participant as it is seen by cooperative HTML content. */
export type HtmlContentRole = 'viewer' | 'player' | 'showman';

interface HtmlContentControlMessage {
	type: 'si:media-control';
	action: 'play' | 'pause' | 'set-volume' | 'answer' | 'answer-end' | 'hello';
	volume?: number;

	/** Name of the local participant. 'hello' only. */
	name?: string;

	/** Role of the local participant. 'hello' only. */
	role?: HtmlContentRole;

	/** Score of the local participant when the greeting was sent. 'hello' of a player only. */
	sum?: number;
}

interface HtmlContentEventMessage {
	type: 'si:media-event';
	event: 'completed' | 'answer-right' | 'answer-wrong' | 'supports-set-volume' | 'hello';
}

/** Converts internal role value to its cooperative HTML content representation. */
export function getHtmlContentRole(role: Role): HtmlContentRole {
	switch (role) {
		case Role.Showman:
			return 'showman';

		case Role.Player:
			return 'player';

		default:
			return 'viewer';
	}
}

/** Builds a greeting message which tells the content who watches it. */
export function buildHelloMessage(name: string, role: Role, sum?: number) {
	return {
		type: 'si:media-control',
		action: 'hello',
		name,
		role: getHtmlContentRole(role),
		sum,
	} satisfies HtmlContentControlMessage;
}

export function HtmlContent(props: HtmlContentProps) {
	const { uri } = props;
	const frameRef = React.useRef<HTMLIFrameElement>(null);
	const completedRef = React.useRef(false);
	const supportRegisteredRef = React.useRef(false);
	const wasAnsweringRef = React.useRef(false);
	const supportIdRef = React.useRef(`html-volume-support:${Math.random().toString(36).slice(2)}`);
	const appDispatch = useAppDispatch();
	const isMediaStopped = useAppSelector(state => state.room2.stage.isGamePaused || state.table.isMediaStopped);
	const isVisible = useAppSelector(state => state.ui.isVisible);
	const soundVolume = useAppSelector(state => state.settings.soundVolume);
	const shouldAnswer = useAppSelector(state => state.room2.stage.decisionType === DecisionType.Answer);
	const name = useAppSelector(state => state.room2.name);
	const role = useAppSelector(state => state.room2.role);
	const sum = useAppSelector(state => getMeAsPlayer(state)?.sum);

	const postControlMessage = React.useCallback((action: HtmlContentControlMessage['action'], volume?: number) => {
		frameRef.current?.contentWindow?.postMessage({
			type: 'si:media-control',
			action,
			volume,
		} satisfies HtmlContentControlMessage, '*');
	}, []);

	const postHelloMessage = React.useCallback(() => {
		frameRef.current?.contentWindow?.postMessage(buildHelloMessage(name, role, sum), '*');
	}, [name, role, sum]);

	React.useEffect(() => {
		completedRef.current = false;
		supportRegisteredRef.current = false;
		appDispatch(unregisterCooperativeHtmlVolumeSupport(supportIdRef.current));
	}, [uri]);

	React.useEffect(() => () => {
		appDispatch(unregisterCooperativeHtmlVolumeSupport(supportIdRef.current));
	}, [appDispatch]);

	React.useEffect(() => {
		const handleMessage = (event: MessageEvent<HtmlContentEventMessage>) => {
			if (event.source !== frameRef.current?.contentWindow) {
				return;
			}

			if (event.data?.type !== 'si:media-event') {
				return;
			}

			switch (event.data.event) {
				case 'supports-set-volume':
					if (supportRegisteredRef.current) {
						return;
					}

					supportRegisteredRef.current = true;
					appDispatch(registerCooperativeHtmlVolumeSupport(supportIdRef.current));
					return;

				case 'hello':
					// Content could start listening after the frame load event, so it is allowed to ask for a greeting itself.
					postHelloMessage();
					return;

				case 'completed':
					if (completedRef.current || isMediaStopped || !isVisible) {
						return;
					}

					completedRef.current = true;
					appDispatch(onMediaEnded({ contentType: 'html', contentValue: uri }));
					return;

				case 'answer-right':
					appDispatch(sendAnswerAsRightByDefault());
					return;

				case 'answer-wrong':
					appDispatch(sendAnswerAsWrongByDefault());
					return;

				default:
					return;
			}
		};

		window.addEventListener('message', handleMessage);

		return () => {
			window.removeEventListener('message', handleMessage);
		};
	}, [appDispatch, isMediaStopped, isVisible, postHelloMessage, uri]);

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

	React.useEffect(() => {
		postControlMessage('set-volume', soundVolume);
	}, [postControlMessage, soundVolume]);

	React.useEffect(() => {
		if (shouldAnswer && !wasAnsweringRef.current) {
			// Try both element and frame window focus so cooperative HTML can receive keyboard input immediately.
			frameRef.current?.focus();
			frameRef.current?.contentWindow?.focus();
			postControlMessage('answer');
		} else if (!shouldAnswer && wasAnsweringRef.current) {
			postControlMessage('answer-end');
		}

		wasAnsweringRef.current = shouldAnswer;
	}, [postControlMessage, shouldAnswer]);

	// allow-scripts & allow-same-origin combination is safe until we serve parent and iframe content from different origins
	return <iframe
		ref={frameRef}
		aria-label='HTML content'
		className={`frame ${shouldAnswer ? 'interactive' : ''}`}
		tabIndex={0}
		src={uri}
		allow='autoplay'
		onLoad={() => {
			appDispatch(onMediaLoaded());
			postHelloMessage();
			postControlMessage('set-volume', soundVolume);
			postControlMessage(isMediaStopped || !isVisible ? 'pause' : 'play');

			if (shouldAnswer) {
				frameRef.current?.focus();
				frameRef.current?.contentWindow?.focus();
			}
		}}
		sandbox='allow-scripts allow-same-origin allow-presentation' />;
}

export default HtmlContent;
