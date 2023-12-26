import * as React from 'react';
import State from '../../state/State';
import { connect } from 'react-redux';
import AutoSizedText from '../common/AutoSizedText';

import './PartialTextContent.css';

interface PartialTextContentProps {
	text: string;
	tail: string;
	readingSpeed: number;
}

const mapStateToProps = (state: State) => ({
	text: state.table.text,
	tail: state.table.tail,
	readingSpeed: state.room.readingSpeed,
});

export class PartialTextContent extends React.Component<PartialTextContentProps> {
	private textRef: React.RefObject<HTMLSpanElement>;

	private tailRef: React.RefObject<HTMLSpanElement>;

	private animationStart = 0;

	private interval: number | undefined;

	constructor(props: PartialTextContentProps) {
		super(props);

		this.textRef = React.createRef<HTMLSpanElement>();
		this.tailRef = React.createRef<HTMLSpanElement>();
	}

	componentDidMount() {
		this.interval = window.setInterval(() => {
			this.animationStart = Math.max(0, this.animationStart - 0.1);
		}, 100);
	}

	componentWillUnmount() {
		if (this.interval) {
			window.clearInterval(this.interval);
		}
	}

	convertToAnimatable(text: string): string {
		let animatedText = '';

		const animationStep = this.props.readingSpeed === 0 ? 0 : 1 / this.props.readingSpeed;

		for (let i = 0; i < text.length; i++) {
			this.animationStart += animationStep;
			const style = `animation-delay: ${this.animationStart}s`;

			animatedText += `<span class="animatablePartialCharacter" style="${style}">${text[i]}</span>`;
		}

		// Last span is used to hold the next portion of partial text. So the partial text forms a tree
		// If you construct partial text as a plain set of spans, the animation would be reset on each text part addition
		return `${animatedText}<span></span>`;
	}

	shouldComponentUpdate(nextProps: PartialTextContentProps) {
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
			<div className='textHost'>
				<AutoSizedText className="tableText nonAligned" maxFontSize={144}>
					<span ref={this.textRef} key="text">{this.props.text}</span>
					<span ref={this.tailRef} key="tail" className="invisible">{this.props.tail}</span>
				</AutoSizedText>
			</div>
		);
	}
}

export default connect(mapStateToProps)(PartialTextContent);
