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

export default function AnswerOptions({ gridMode = false }: { gridMode?: boolean }): JSX.Element {
	const { optionsRowCount, optionsColumnCount, answerOptions, isSelectable } = useAppSelector((rootState: RootState) => ({
		optionsRowCount: rootState.table.optionsRowCount,
		optionsColumnCount: rootState.table.optionsColumnCount,
		answerOptions: rootState.table.answerOptions,
		isSelectable: rootState.table.isSelectable,
	}));

	const displayAnswerOptionsLabels = useAppSelector((rootState: RootState) => rootState.room2.settings.displayAnswerOptionsLabels);
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

	// Use grid layout with calculated row and column count
	const gridStyle = gridMode ? {
		display: 'grid',
		gridTemplateRows: `repeat(${optionsRowCount}, 1fr)`,
		gridTemplateColumns: `repeat(${optionsColumnCount}, 1fr)`,
		gap: '4px'
	} : {};

	return (
		<div className={`answerOptions ${isSelectable ? 'selectable' : ''}`} style={gridStyle}>
			{answerOptions.map((o, i) => (
				<div key={i} className={`answerOption ${getOptionClass(o.state)}`} onClick={() => onSelectAnswerOption(o.label)}>
					{displayAnswerOptionsLabels ? <div className='optionLabel'>
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
