import * as React from 'react';
import Link from '../Link/Link';
import localization from '../../../model/resources/localization';
import searchOnlineUri from '../../../utils/searchOnlineUri';
import { copyToClipboard } from '../../../state/globalActions';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { userInfoChanged } from '../../../state/commonSlice';

import './ClickableAnswer.scss';

interface ClickableAnswerProps {
	text: string;

	/** Custom content to display instead of the plain answer text. */
	children?: React.ReactNode;
}

/** Displays an answer that could be searched online by click and copied to clipboard by right click. */
export default function ClickableAnswer(props: ClickableAnswerProps): JSX.Element {
	const clipboardSupported = useAppSelector(state => state.common.clipboardSupported);
	const appDispatch = useAppDispatch();

	const onContextMenu = (e: React.MouseEvent) => {
		if (!clipboardSupported) {
			return;
		}

		e.preventDefault();
		e.nativeEvent.stopPropagation(); // Otherwise the global handler would press the game button
		appDispatch(copyToClipboard(props.text));
		appDispatch(userInfoChanged(localization.answerCopied));
	};

	return (
		<span onContextMenu={onContextMenu}>
			<Link className="clickableAnswer" href={searchOnlineUri(props.text)} target="_blank" rel="noopener noreferrer">
				{props.children ?? props.text}
			</Link>
		</span>
	);
}
