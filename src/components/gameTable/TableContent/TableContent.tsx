import * as React from 'react';
import { connect } from 'react-redux';
import State from '../../../state/State';
import TableBorder from '../TableBorder/TableBorder';
import ContentType from '../../../model/enums/ContentType';
import AudioContent from '../AudioContent/AudioContent';
import ContentGroup from '../../../model/ContentGroup';
import LayoutMode from '../../../model/enums/LayoutMode';
import AnswerOptions from '../AnswerOptions/AnswerOptions';
import Constants from '../../../model/enums/Constants';
import StackedContent from '../StackedContent/StackedContent';
import ExternalMediaWarning from '../ExternalMediaWarning/ExternalMediaWarning';
import { useAudioContext } from '../../../contexts/AudioContextProvider';

import './TableContent.css';

interface TableContentProps {
	layoutMode: LayoutMode;
	content: ContentGroup[];
	audio: string;
	prependText: string;
	appendText: string;
	externalMediaUris: string[];
	attachContentToTable: boolean;
}

const mapStateToProps = (state: State) => ({
	content: state.table.content,
	audio: state.table.audio,
	layoutMode: state.table.layoutMode,
	prependText: state.table.prependText,
	appendText: state.table.appendText,
	externalMediaUris: state.table.externalMediaUris,
	attachContentToTable: state.settings.attachContentToTable,
});

function getLayout(layoutMode: LayoutMode, mainContent: JSX.Element) {
	return layoutMode === LayoutMode.Simple
		? mainContent
		: <div className='optionsLayout'>{mainContent}<AnswerOptions /></div>;
}

const TableContentComponent: React.FC<TableContentProps> = (props) => {
	const { audioContext, canPlayAudio } = useAudioContext();

	const getAudioContent = (): React.ReactNode => props.audio.length > 0
		? (<div className='centerBlock'><span className="clef rotate">&amp;</span></div>)
		: null;

	let { content } = props;

	if (props.externalMediaUris.length > 0) {
		return <ExternalMediaWarning />;
	}

	if (props.attachContentToTable &&
		((props.audio.length > 0 &&
			content.length === 0) ||
		(props.audio.length === 0 &&
			content.length === 1 &&
			content[0].content.length === 1 &&
			content[0].content[0].type !== ContentType.Text))) {
		if (props.appendText.length > 0) {
			const textWeight = Math.min(Constants.LARGE_CONTENT_WEIGHT, Math.max(1, props.appendText.length / 80));

			content = [...content, {
				columnCount: 1,
				weight: textWeight,
				content: [{
					type: ContentType.Text,
					value: props.appendText,
					read: false,
					partial: false
				}]
			}];
		} else if (props.prependText.length > 0) {
			const textWeight = Math.min(Constants.LARGE_CONTENT_WEIGHT, Math.max(1, props.prependText.length / 80));

			content = [ {
				columnCount: 1,
				weight: textWeight,
				content: [{
					type: ContentType.Text,
					value: props.prependText,
					read: false,
					partial: false
				}]
			}, ...content];
		}
	}

	const mainContent = content.length > 0
		? <StackedContent content={content} canPlayAudio={canPlayAudio} />
		: <div className='mainContent'>{getAudioContent()}</div>;

	return (
		<TableBorder>
			<div className='table-content'>
				{getLayout(props.layoutMode, mainContent)}

				<AudioContent audioContext={audioContext} autoPlayEnabled={canPlayAudio} />
			</div>
		</TableBorder>
	);
};

export default connect(mapStateToProps)(TableContentComponent);