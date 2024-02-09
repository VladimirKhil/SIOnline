import * as React from 'react';
import { connect } from 'react-redux';
import State from '../../../state/State';
import TableBorder from '../TableBorder';
import ContentItem from '../../../model/ContentItem';
import ContentType from '../../../model/enums/ContentType';
import TextContent from '../TextContent';
import ImageContent from '../ImageContent';
import VideoContent from '../VideoContent';
import HtmlContent from '../HtmlContent';
import AudioContent from '../AudioContent';
import VolumeButton from '../../common/VolumeButton';
import ContentGroup from '../../../model/ContentGroup';
import LayoutMode from '../../../model/enums/LayoutMode';
import AnswerOptions from '../AnswerOptions/AnswerOptions';
import PartialTextContent from '../PartialTextContent';
import Constants from '../../../model/enums/Constants';

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
	isVolumeControlVisible: boolean;
}

const mapStateToProps = (state: State) => ({
	content: state.table.content,
	audio: state.table.audio,
	layoutMode: state.table.layoutMode,
	prependText: state.table.prependText,
	appendText: state.table.appendText,
	attachContentToTable: state.settings.attachContentToTable,
});

function getContent(content: ContentItem, key: React.Key, autoPlayEnabled: boolean): JSX.Element | null {
	switch (content.type) {
		case ContentType.Text:
			return content.partial
				? <PartialTextContent key={key} />
				: <TextContent key={key} text={content.value} animateReading={content.read} />;

		case ContentType.Image:
			return <ImageContent key={key} uri={content.value} />;

		case ContentType.Video:
			return <VideoContent key={key} uri={content.value} autoPlayEnabled={autoPlayEnabled} />;

		case ContentType.Html:
			return <HtmlContent key={key} uri={content.value} />;

		default:
			return null;
	}
}

function getGroupContent(group: ContentGroup, key: React.Key, autoPlayEnabled: boolean): JSX.Element | null {
	return (
		<div
			key={key}
			className='table-content-group'
			style={{ flex: `${group.weight}`, gridTemplateColumns: `repeat(${group.columnCount}, 1fr)` }}>
			{group.content.map((c, i) => getContent(c, i, autoPlayEnabled))}
		</div>
	);
}

function getLayout(layoutMode: LayoutMode, mainContent: JSX.Element) {
	return layoutMode === LayoutMode.Simple
		? mainContent
		: <div className='optionsLayout'>{mainContent}<AnswerOptions /></div>;
}

export class TableContent extends React.Component<TableContentProps, TableContentState> {
	audioContextEventListener: () => void = () => {};

	constructor(props: TableContentProps) {
		super(props);

		this.state = {
			canPlayAudio: audioContext.state === 'running',
			isVolumeControlVisible: false,
		};
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
	}

	componentWillUnmount(): void {
		audioContext.removeEventListener('statechange', this.audioContextEventListener);
	}

	toggleVisibility = () => {
		if (!this.state.canPlayAudio) {
			audioContext.resume();
			audioContext.createGain();

			this.setState({
				canPlayAudio: true
			});
		} else {
			this.setState((state) => ({ ...state, isVolumeControlVisible: !this.state.isVolumeControlVisible }));
		}
	};

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

		const mainContent = <div className='mainContent'>
			{content.length > 0 ? content.map((c, i) => getGroupContent(c, i, this.state.canPlayAudio)) : this.getAudioContent()}
		</div>;

		return (
			<TableBorder>
				<div className='table-content'>
					{getLayout(this.props.layoutMode, mainContent)}
					{hasSound
						? <VolumeButton
							canPlayAudio={this.state.canPlayAudio}
							isVolumeControlVisible={this.state.isVolumeControlVisible}
							toggleVisibility={this.toggleVisibility} />
						: null}
					<AudioContent audioContext={audioContext} autoPlayEnabled={this.state.canPlayAudio} />
				</div>
			</TableBorder>
		);
	}
}

export default connect(mapStateToProps)(TableContent);