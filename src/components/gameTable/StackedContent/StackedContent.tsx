import * as React from 'react';
import ContentGroup from '../../../model/ContentGroup';
import ContentItem from '../../../model/ContentItem';
import ContentType from '../../../model/enums/ContentType';
import PartialTextContent from '../PartialTextContent/PartialTextContent';
import TextContent from '../TextContent/TextContent';
import ImageContent from '../ImageContent/ImageContent';
import VideoContent from '../VideoContent/VideoContent';
import HtmlContent from '../HtmlContent/HtmlContent';

import './StackedContent.css';

interface StackedContentProps {
	content: ContentGroup[];
	canPlayAudio: boolean;
}

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

export default function StackedContent(props: StackedContentProps): JSX.Element {
	return <div className='mainContent'>{props.content.map((c, i) => getGroupContent(c, i, props.canPlayAudio))}</div>;
}