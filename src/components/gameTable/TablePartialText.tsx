import * as React from 'react';
import State from '../../state/State';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import AutoSizedText from '../common/AutoSizedText';
import TableBorder from './TableBorder';

import './TablePartialText.css';

interface TablePartialTextProps {
	text: string;
	tail: string;
	readingSpeed: number;
}

const mapStateToProps = (state: State) => ({
	text: state.run.table.text,
	tail: state.run.table.tail,
	readingSpeed: state.run.readingSpeed
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({

});

export class TablePartialText extends React.Component<TablePartialTextProps> {
	private textRef: React.RefObject<HTMLSpanElement>;

	private tailRef: React.RefObject<HTMLSpanElement>;

	constructor(props: TablePartialTextProps) {
		super(props);

		this.textRef = React.createRef<HTMLSpanElement>();
		this.tailRef = React.createRef<HTMLSpanElement>();
	}

	convertToAnimatable(text: string): string {
		let animatedText = '';

		const animationStep = this.props.readingSpeed === 0 ? 0 : 1 / this.props.readingSpeed;
		let animation = 0;

		for (let i = 0; i < text.length; i++) {
			animation += animationStep;
			const style = `animation-delay: ${animation}s`;

			animatedText += `<span class="animatablePartialCharacter" style="${style}">${text[i]}</span>`;
		}

		// Last span is used to hold the next portion of partial text. So the partial text forms a tree
		// If you construct partial text as a plain set of spans, the animation would be reset on each text part addition
		return `${animatedText}<span></span>`;
	}

	shouldComponentUpdate(nextProps: TablePartialTextProps) {
		// We update component manually so we always return false
		if (nextProps.text !== this.props.text && this.textRef.current && this.tailRef.current) {
			let lastChild: ChildNode = this.textRef.current;

			while (lastChild.lastChild) {
				lastChild = lastChild.lastChild;
			}

			(lastChild as HTMLSpanElement).innerHTML += this.convertToAnimatable(nextProps.text.substring(this.props.text.length));
			this.tailRef.current.innerHTML = this.tailRef.current.innerHTML.substring(nextProps.text.length - this.props.text.length);
		}

		return false;
	}

	render() {
		return (
			<TableBorder>
				<AutoSizedText className="tableText nonAligned" maxFontSize={144}>
					<span ref={this.textRef} key="text">{this.props.text}</span>
					<span ref={this.tailRef} key="tail" className="invisible">{this.props.tail}</span>
				</AutoSizedText>
			</TableBorder>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(TablePartialText);
