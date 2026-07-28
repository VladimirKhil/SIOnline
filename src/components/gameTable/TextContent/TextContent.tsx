import * as React from 'react';
import AutoSizedText from '../../common/AutoSizedText/AutoSizedText';
import { useAppSelector } from '../../../state/hooks';
import ClickableAnswer from '../../common/ClickableAnswer/ClickableAnswer';

import '../TableText/TableText.scss';

interface TextContentProps {
	text: string;
	animateReading: boolean;
}

function getAnimatableContent(text: string, readingSpeed: number, animationCycle: number) {
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

		animatedText.push(<span key={`${animationCycle}-${i}`} className="animatableCharacter" style={style}>{text[i]}</span>);
	}

	return <span key={animationCycle}>{animatedText}</span>;
}

export default function TextContent(props: TextContentProps) {
	const room = useAppSelector((state) => state.room2);
	const isAnswer = useAppSelector((state) => state.table.isAnswer);
	const previousTextRef = React.useRef(props.text);
	const [animationCycle, setAnimationCycle] = React.useState(0);

	React.useEffect(() => {
		if (!props.animateReading) {
			previousTextRef.current = props.text;
			return;
		}

		if (previousTextRef.current !== props.text) {
			setAnimationCycle((currentCycle) => currentCycle + 1);
		}

		previousTextRef.current = props.text;
	}, [props.animateReading, props.text]);

	const content = props.animateReading && room.settings.readingSpeed > 0
		? getAnimatableContent(props.text, room.settings.readingSpeed, animationCycle)
		: props.text;

	return (
		<div className='textHost'>
			<AutoSizedText className="tableText fadeIn tableTextCenter" maxFontSize={72}>
				{isAnswer ? <ClickableAnswer text={props.text}>{content}</ClickableAnswer> : content}
			</AutoSizedText>
		</div>
	);
}
