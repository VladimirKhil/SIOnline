import React, { useState, useEffect, useRef } from 'react';
import { shallowEqual } from 'react-redux';
import { useAppSelector } from '../../../state/hooks';
import fitElement from '../../../utils/fitElement';

import './PartialTextContent.scss';

export default function PartialTextContent() {
	const divRef = useRef<HTMLDivElement>(null);

	const { text, totalLength, readingSpeed, isGamePaused } = useAppSelector(state => ({
		text: state.table.text + state.table.tail,
		totalLength: state.table.text.length,
		readingSpeed: state.room2.settings.readingSpeed,
		isGamePaused: state.room2.stage.isGamePaused,
	}), shallowEqual);

	const [visibleLength, setVisibleLength] = useState(0);

	useEffect(() => {
		if (divRef.current) {
			divRef.current.style.fontSize = '';
			fitElement(divRef.current, 144);
			const { fontSize } = window.getComputedStyle(divRef.current);
			divRef.current.style.fontSize = (parseFloat(fontSize) * 0.95) + 'px'; // Adjust font size slightly for better fit
		}
	}, [text.length]);

	useEffect(() => {
		const interval = window.setInterval(
			() => {
				if (isGamePaused) {
					return;
				}

				setVisibleLength(prev => {
					if (prev >= totalLength) {
						return prev;
					}
					return Math.min(prev + (readingSpeed / 10), totalLength);
				});
			},
			100
		);

		return () => {
			window.clearInterval(interval);
		};
	}, [isGamePaused, totalLength, readingSpeed]);

	useEffect(() => {
		if (visibleLength > totalLength) {
			setVisibleLength(totalLength);
		}
	}, [totalLength, visibleLength]);

	const visibleText = text.slice(0, visibleLength);
	const hiddenText = text.slice(visibleLength);

	return (
		<div className='textHost'>
			<div ref={divRef} className="tableText nonAligned">
				<span>
					<span className="animatablePartialCharacter">{visibleText}</span>
					<span className="invisible">{hiddenText}</span>
				</span>
			</div>
		</div>
	);
}
