import * as React from 'react';
import State from '../../state/State';
import { connect } from 'react-redux';
import AutoSizedText from '../common/AutoSizedText';

import './TableText.css';

interface TextContentProps {
	text: string;
	animateReading: boolean;

	readingSpeed: number;
}

const mapStateToProps = (state: State) => ({
	readingSpeed: state.room.readingSpeed,
});

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

export function TextContent(props: TextContentProps) {
	return (
		<div className='textHost'>
			<AutoSizedText className="tableText tableTextCenter" maxFontSize={144}>
				{props.animateReading && props.readingSpeed > 0 ? getAnimatableContent(props.text, props.readingSpeed) : props.text}
			</AutoSizedText>
		</div>
	);
}

export default connect(mapStateToProps)(TextContent);
