import * as React from 'react';
import AutoSizedText from '../../common/AutoSizedText/AutoSizedText';
import { useAppSelector } from '../../../state/hooks';

import '../TableText/TableText.scss';

interface TextContentProps {
	text: string;
	animateReading: boolean;
}

function getAnimatableContent(text: string, readingSpeed: number) {
	// Each letter is wrapped into its own span with animation-delay.
	// If there is a better way for performing this karaoke-style multiline animation, feel free to implement it
	const animatedText: JSX.Element[] = [];
	const animationStep = 1 / readingSpeed;
	let animation = 0;

	for (let i = 0; i < text.length; i++) {
		animation += animationStep;

		const style: React.CSSProperties = {
			animationDelay: `${animation}s`
		};

		animatedText.push(<span key={i} className="animatableCharacter" style={style}>{text[i]}</span>);
	}

	return <span>{animatedText}</span>;
}

export default function TextContent(props: TextContentProps) {
	const room = useAppSelector((state) => state.room2);

	return (
		<div className='textHost'>
			<AutoSizedText className="tableText fadeIn tableTextCenter" maxFontSize={72}>
				{props.animateReading && room.settings.readingSpeed > 0 ? getAnimatableContent(props.text, room.settings.readingSpeed) : props.text}
			</AutoSizedText>
		</div>
	);
}
