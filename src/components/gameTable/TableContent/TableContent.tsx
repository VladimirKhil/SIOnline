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

import './TableContent.css';

interface TableContentProps {
	layoutMode: LayoutMode;
	content: ContentGroup[];
	audio: string;
	prependText: string;
	appendText: string;
}

const mapStateToProps = (state: State) => ({
	content: state.table.content,
	audio: state.table.audio,
	layoutMode: state.table.layoutMode,
	prependText: state.table.prependText,
	appendText: state.table.appendText,
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

export function TableContent(props: TableContentProps): JSX.Element {
	const [autoPlayEnabled, setAutoPlayEnabled] = React.useState(false);

	function getAudioContent(): React.ReactNode {
		return props.audio.length > 0
			? (<div className='centerBlock'><span className="clef rotate">&amp;</span></div>)
			: null;
	}

	let { content } = props;

	if (props.audio.length > 0
		|| content.length === 1 && content[0].content.length === 1 && content[0].content[0].type !== ContentType.Text) {
		if (props.appendText.length > 0) {
			content = [...content, {
				columnCount: 1,
				weight: 1,
				content: [{
					type: ContentType.Text,
					value: props.appendText,
					read: false,
					partial: false
				}]
			}];
		} else if (props.prependText.length > 0) {
			content = [ {
				columnCount: 1,
				weight: 1,
				content: [{
					type: ContentType.Text,
					value: props.prependText,
					read: false,
					partial: false
				}]
			}, ...content];
		}
	}

	const hasSound = props.audio.length > 0 || content.some(g => g.content.some(c => c.type === ContentType.Video));

	const mainContent = <div className='mainContent'>
		{content.length > 0 ? content.map((c, i) => getGroupContent(c, i, autoPlayEnabled)) : getAudioContent()}
	</div>;

	return (
		<TableBorder>
			<div className='table-content'>
				{getLayout(props.layoutMode, mainContent)}
				{hasSound ? <VolumeButton onEnableAudioPlay={() => { setAutoPlayEnabled(true); }} /> : null}
				<AudioContent />
			</div>
		</TableBorder>
	);
}

export default connect(mapStateToProps)(TableContent);