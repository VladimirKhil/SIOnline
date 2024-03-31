import * as React from 'react';
import State from '../../state/State';
import { connect } from 'react-redux';
import fitElement from '../../utils/fitElement';

import './PartialTextContent.css';

interface PartialTextContentProps {
	text: string;
	visibleLength: number;
	readingSpeed: number;
	isGamePaused: boolean;
}

interface PartialTextContentState {
	visibleLength: number;
}

const mapStateToProps = (state: State) => ({
	text: state.table.text + state.table.tail,
	visibleLength: state.table.text.length,
	readingSpeed: state.room.readingSpeed,
	isGamePaused: state.room.stage.isGamePaused,
});

export class PartialTextContent extends React.Component<PartialTextContentProps, PartialTextContentState> {
	private divRef: React.RefObject<HTMLDivElement>;

	private interval: number | undefined;

	constructor(props: PartialTextContentProps) {
		super(props);
		this.divRef = React.createRef<HTMLDivElement>();
		this.state = { visibleLength: 0 };
	}

	componentDidMount() {
		if (this.divRef.current) {
			fitElement(this.divRef.current, 144);
		}

		this.interval = window.setInterval(() => {
			if (this.props.isGamePaused || this.state.visibleLength >= this.props.visibleLength) {
				return;
			}

			this.setState(s => ({ visibleLength: s.visibleLength + (this.props.readingSpeed / 10) }));
		}, 100);
	}

	componentWillUnmount() {
		if (this.interval) {
			window.clearInterval(this.interval);
		}
	}

	render() {
		return (
			<div className='textHost'>
				<div ref={this.divRef} className="tableText nonAligned">
					<span>
						{this.props.text.split('').map((c, i) => <span
							key={i}
							className={i < this.state.visibleLength ? 'animatablePartialCharacter' : 'invisible'}
							>{c}</span>)}
					</span>
				</div>
			</div>
		);
	}
}

export default connect(mapStateToProps)(PartialTextContent);
