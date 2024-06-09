import * as React from 'react';
import { connect } from 'react-redux';
import State from '../../../state/State';
import AnswerOption from '../../../model/AnswerOption';
import ContentItem from '../../../model/ContentItem';
import ContentType from '../../../model/enums/ContentType';
import TextContent from '../TextContent';
import ImageContent from '../ImageContent';
import ItemState from '../../../model/enums/ItemState';
import { Action, Dispatch } from 'redux';
import roomActionCreators from '../../../state/room/roomActionCreators';
import AutoSizedText from '../../common/AutoSizedText';

import './AnswerOptions.css';

interface AnswerOptionsProps {
	options: AnswerOption[];
	isSelectable: boolean;
	displayAnswerOptionsLabels: boolean;

	onSelectAnswerOption: (label: string) => void;
}

const mapStateToProps = (state: State) => ({
	options: state.table.answerOptions,
	isSelectable: state.table.isSelectable,
	displayAnswerOptionsLabels: state.room.settings.displayAnswerOptionsLabels,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onSelectAnswerOption: (label: string) => {
		dispatch(roomActionCreators.selectAnswerOption(label) as unknown as Action);
	},
});

function getContent(content: ContentItem): JSX.Element | null {
	switch (content.type) {
		case ContentType.Text:
			return <TextContent text={content.value} animateReading={content.read} />;

		case ContentType.Image:
			return <ImageContent uri={content.value} />;

		default:
			return null;
	}
}

export function AnswerOptions(props: AnswerOptionsProps) {
	function getOptionClass(state: ItemState) {
		switch (state) {
			case ItemState.Active:
				return 'active';

			case ItemState.Right:
				return 'right';

			case ItemState.Wrong:
				return 'wrong';

			default:
				return 'normal';
		}
	}

	return (
		<div className={`answerOptions ${props.isSelectable ? 'selectable' : ''}`}>
			{props.options.map((o, i) => (
				<div key={i} className={`answerOption ${getOptionClass(o.state)}`} onClick={() => props.onSelectAnswerOption(o.label)}>
					{props.displayAnswerOptionsLabels ? <div className='optionLabel'>
						<AutoSizedText maxFontSize={50}>{o.label}</AutoSizedText>
					</div> : null}

					<div className='optionContent'>
						{getContent(o.content)}
					</div>
				</div>
				))}
		</div>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(AnswerOptions);
