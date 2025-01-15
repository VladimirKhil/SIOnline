import * as React from 'react';
import { connect } from 'react-redux';
import State from '../../../state/State';
import ContentItem from '../../../model/ContentItem';
import ContentType from '../../../model/enums/ContentType';
import TextContent from '../TextContent/TextContent';
import ImageContent from '../ImageContent/ImageContent';
import ItemState from '../../../model/enums/ItemState';
import { Action, Dispatch } from 'redux';
import roomActionCreators from '../../../state/room/roomActionCreators';
import AutoSizedText from '../../common/AutoSizedText/AutoSizedText';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { AppDispatch, RootState } from '../../../state/store';

import './AnswerOptions.scss';

interface AnswerOptionsProps {
	displayAnswerOptionsLabels: boolean;

	onSelectAnswerOption: (label: string, appDispatch: AppDispatch) => void;
}

const mapStateToProps = (state: State) => ({
	displayAnswerOptionsLabels: state.room.settings.displayAnswerOptionsLabels,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onSelectAnswerOption: (label: string, appDispatch: AppDispatch) => {
		dispatch(roomActionCreators.selectAnswerOption(label, appDispatch) as unknown as Action);
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
	const state = useAppSelector((rootState: RootState) => rootState.table);
	const appDispatch = useAppDispatch();

	function getOptionClass(itemState: ItemState) {
		switch (itemState) {
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
		<div className={`answerOptions ${state.isSelectable ? 'selectable' : ''}`}>
			{state.answerOptions.map((o, i) => (
				<div key={i} className={`answerOption ${getOptionClass(o.state)}`} onClick={() => props.onSelectAnswerOption(o.label, appDispatch)}>
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
