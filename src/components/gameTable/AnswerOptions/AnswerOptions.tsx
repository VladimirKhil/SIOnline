import * as React from 'react';
import ContentItem from '../../../model/ContentItem';
import ContentType from '../../../model/enums/ContentType';
import TextContent from '../TextContent/TextContent';
import ImageContent from '../ImageContent/ImageContent';
import ItemState from '../../../model/enums/ItemState';
import AutoSizedText from '../../common/AutoSizedText/AutoSizedText';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { RootState } from '../../../state/store';
import { selectAnswerOption } from '../../../state/serverActions';

import './AnswerOptions.scss';

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

export default function AnswerOptions() {
	const table = useAppSelector((rootState: RootState) => rootState.table);
	const room = useAppSelector((rootState: RootState) => rootState.room2);
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

	function onSelectAnswerOption(label: string): void {
		appDispatch(selectAnswerOption(label));
	}

	return (
		<div className={`answerOptions ${table.isSelectable ? 'selectable' : ''}`}>
			{table.answerOptions.map((o, i) => (
				<div key={i} className={`answerOption ${getOptionClass(o.state)}`} onClick={() => onSelectAnswerOption(o.label)}>
					{room.settings.displayAnswerOptionsLabels ? <div className='optionLabel'>
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
