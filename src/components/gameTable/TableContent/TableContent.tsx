import * as React from 'react';
import { connect } from 'react-redux';
import State from '../../../state/State';
import TableBorder from '../TableBorder/TableBorder';
import ContentType from '../../../model/enums/ContentType';
import AudioContent from '../AudioContent/AudioContent';
import VolumeButton from '../../common/VolumeButton/VolumeButton';
import ContentGroup from '../../../model/ContentGroup';
import LayoutMode from '../../../model/enums/LayoutMode';
import AnswerOptions from '../AnswerOptions/AnswerOptions';
import Constants from '../../../model/enums/Constants';
import StackedContent from '../StackedContent/StackedContent';

import './TableContent.css';

const audioContext = new AudioContext();

interface TableContentProps {
	layoutMode: LayoutMode;
	content: ContentGroup[];
	audio: string;
	prependText: string;
	appendText: string;
	attachContentToTable: boolean;
}

interface TableContentState {
	canPlayAudio: boolean;
}

const mapStateToProps = (state: State) => ({
	content: state.table.content,
	audio: state.table.audio,
	layoutMode: state.table.layoutMode,
	prependText: state.table.prependText,
	appendText: state.table.appendText,
	attachContentToTable: state.settings.attachContentToTable,
});

function getLayout(layoutMode: LayoutMode, mainContent: JSX.Element) {
	return layoutMode === LayoutMode.Simple
		? mainContent
		: <div className='optionsLayout'>{mainContent}<AnswerOptions /></div>;
}

// TODO: move audio controlling out of this component

export class TableContent extends React.Component<TableContentProps, TableContentState> {
	audioContextEventListener: () => void = () => {};

	constructor(props: TableContentProps) {
		super(props);

		this.state = {
			canPlayAudio: audioContext.state === 'running',
		};

		this.runAudioContext = this.runAudioContext.bind(this);
	}

	runAudioContext() {
		if (!this.state.canPlayAudio) {
			audioContext.resume();
			audioContext.createGain();

			this.setState({
				canPlayAudio: true
			});
		}

		window.removeEventListener('click', this.runAudioContext);
	}

	componentDidMount(): void {
		this.audioContextEventListener = () => {
			const canPlay = audioContext.state === 'running';

			this.setState({
				canPlayAudio: canPlay
			});

			if (canPlay) {
				audioContext.removeEventListener('statechange', this.audioContextEventListener);
			}
		};

		audioContext.addEventListener('statechange', this.audioContextEventListener);
		audioContext.resume().then(this.audioContextEventListener);

		if (!this.state.canPlayAudio) {
			window.addEventListener('click', this.runAudioContext);
		}
	}

	componentWillUnmount(): void {
		audioContext.removeEventListener('statechange', this.audioContextEventListener);
	}

	getAudioContent(): React.ReactNode {
		return this.props.audio.length > 0
			? (<div className='centerBlock'><span className="clef rotate">&amp;</span></div>)
			: null;
	}

	render() {
		let { content } = this.props;

		if (this.props.attachContentToTable &&
				((this.props.audio.length > 0 &&
					content.length === 0) ||
				(this.props.audio.length === 0 &&
					content.length === 1 &&
					content[0].content.length === 1 &&
					content[0].content[0].type !== ContentType.Text))) {
			if (this.props.appendText.length > 0) {
				const textWeight = Math.min(Constants.LARGE_CONTENT_WEIGHT, Math.max(1, this.props.appendText.length / 80));

				content = [...content, {
					columnCount: 1,
					weight: textWeight,
					content: [{
						type: ContentType.Text,
						value: this.props.appendText,
						read: false,
						partial: false
					}]
				}];
			} else if (this.props.prependText.length > 0) {
				const textWeight = Math.min(Constants.LARGE_CONTENT_WEIGHT, Math.max(1, this.props.prependText.length / 80));

				content = [ {
					columnCount: 1,
					weight: textWeight,
					content: [{
						type: ContentType.Text,
						value: this.props.prependText,
						read: false,
						partial: false
					}]
				}, ...content];
			}
		}

		const hasSound = this.props.audio.length > 0 || content.some(g => g.content.some(c => c.type === ContentType.Video));

		const mainContent = content.length > 0
			? <StackedContent content={content} canPlayAudio={this.state.canPlayAudio} />
			: <div className='mainContent'>{this.getAudioContent()}</div>;

		return (
			<TableBorder>
				<div className='table-content'>
					{getLayout(this.props.layoutMode, mainContent)}

					{hasSound
						? <VolumeButton canPlayAudio={this.state.canPlayAudio} />
						: null}

					<AudioContent audioContext={audioContext} autoPlayEnabled={this.state.canPlayAudio} />
				</div>
			</TableBorder>
		);
	}
}

export default connect(mapStateToProps)(TableContent);