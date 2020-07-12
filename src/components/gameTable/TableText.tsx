import * as React from 'react';
import State from '../../state/State';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import AutoSizedText from '../autoSizedText/AutoSizedText';
import TableBorder from './TableBorder';

import './TableText.css';

interface TableTextProps {
	text: string;
	animateReading: boolean;
	readingSpeed: number;
}

const mapStateToProps = (state: State) => ({
	text: state.run.table.text,
	animateReading: state.run.table.animateReading,
	readingSpeed: state.run.readingSpeed
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({

});

// tslint:disable-next-line: function-name
export function TableText(props: TableTextProps) {
	let textElem: JSX.Element;
	if (props.animateReading) {
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
		textElem = <AutoSizedText className="tableText tableTextCenter" content={content} maxFontSize={144} />;
	} else {
		textElem = <AutoSizedText className="tableText tableTextCenter" text={props.text} maxFontSize={144} />;
	}

	return (
		<TableBorder>
			{textElem}
		</TableBorder>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(TableText);
