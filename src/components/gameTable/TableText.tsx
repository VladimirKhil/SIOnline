import * as React from 'react';
import State from '../../state/State';
import { connect } from 'react-redux';
import AutoSizedText from '../common/AutoSizedText';
import TableBorder from './TableBorder';
import TableAudio from './TableAudio';

import './TableText.css';

interface TableTextProps {
	text: string;
	animateReading: boolean;
	readingSpeed: number;
}

const mapStateToProps = (state: State) => ({
	text: state.table.text,
	animateReading: state.table.animateReading,
	readingSpeed: state.run.readingSpeed,
});

export function TableText(props: TableTextProps) {
	let textElem: JSX.Element;

	if (props.animateReading && props.readingSpeed > 0) {
		// Each letter is wrapped into its own span with animation-delay.
		// If there is a better way for performing this karaoke-style multiline animation, feel free to implement it

		const animatedText: JSX.Element[] = [];
		const animationStep = 1 / props.readingSpeed;
		let animation = 0;
		for (let i = 0; i < props.text.length; i++) {
			animation += animationStep;

			const style: React.CSSProperties = {
				animationDelay: `${animation}s`
			};

			animatedText.push(<span key={i} className="animatableCharacter" style={style}>{props.text[i]}</span>);
		}

		const content = <span>{animatedText}</span>;
		textElem = <AutoSizedText className="tableText tableTextCenter" maxFontSize={144}>{content}</AutoSizedText>;
	} else {
		textElem = <AutoSizedText className="tableText tableTextCenter" maxFontSize={144}>{props.text}</AutoSizedText>;
	}

	return (
		<TableBorder>
			{textElem}
			<TableAudio />
		</TableBorder>
	);
}

export default connect(mapStateToProps)(TableText);
