import * as React from 'react';
import State from '../../state/State';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import AutoSizedText from '../autoSizedText/AutoSizedText';

import './TableText.css';

interface TableTextProps {
	canTry: boolean;
	text: string;
	animateReading: boolean;
	readingSpeed: number;
}

const mapStateToProps = (state: State) => ({
	canTry: state.run.table.canPress,
	text: state.run.table.text,
	animateReading: state.run.table.animateReading,
	readingSpeed: state.run.readingSpeed
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({

});

// tslint:disable-next-line: function-name
export function TableText(props: TableTextProps) {
	const style: React.CSSProperties = {
		borderColor: props.canTry ? '#FFE682' : 'transparent'
	};

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
		<div className="tableBorder tableBorderCentered" style={style}>
			{textElem}
		</div>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(TableText);
