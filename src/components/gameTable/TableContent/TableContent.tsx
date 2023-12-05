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

import './TableContent.css';

interface TableContentProps {
	content: ContentItem[];
	audio: string;

	onMediaPlay: () => void;
}

const mapStateToProps = (state: State) => ({
	content: state.table.content,
	audio: state.table.audio,
});

function getContent(content: ContentItem, key: React.Key, autoPlayEnabled: boolean): JSX.Element | null {
	switch (content.type) {
		case ContentType.Text:
			return <TextContent key={key} text={content.value} animateReading={content.read} weight={content.weight} />;

		case ContentType.Image:
			return <ImageContent key={key} uri={content.value} weight={content.weight} />;

		case ContentType.Video:
			return <VideoContent key={key} uri={content.value} autoPlayEnabled={autoPlayEnabled} weight={content.weight} />;

		case ContentType.Html:
			return <HtmlContent key={key} uri={content.value} weight={content.weight} />;

		default:
			return null;
	}
}

export function TableContent(props: TableContentProps): JSX.Element {
	const [autoPlayEnabled, setAutoPlayEnabled] = React.useState(false);

	function getAudioContent(): React.ReactNode {
		return props.audio.length > 0
			? (<div className='centerBlock'><span className="clef rotate">&amp;</span></div>)
			: null;
	}

	const hasSound = props.audio.length > 0 || props.content.some(c => c.type === ContentType.Video);

	return (
		<TableBorder>
			<div className='table-content'>
				{props.content.length > 0 ? props.content.map((c, i) => getContent(c, i, autoPlayEnabled)) : getAudioContent()}
				{hasSound ? <VolumeButton onEnableAudioPlay={() => { setAutoPlayEnabled(true); props.onMediaPlay(); }} /> : null}
				<AudioContent />
			</div>
		</TableBorder>
	);
}

export default connect(mapStateToProps)(TableContent);