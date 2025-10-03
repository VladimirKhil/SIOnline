import * as React from 'react';
import AutoSizedText from '../../common/AutoSizedText/AutoSizedText';
import { RootState } from '../../../state/store';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { selectTheme } from '../../../state/serverActions';
import getBestRowColumnCount from '../../../utils/stackedContentHelper';

import './ThemeStack.scss';

export default function ThemeStack() {
	const table = useAppSelector((rootState: RootState) => rootState.table);
	const appDispatch = useAppDispatch();

	const onSelectTheme = (themeIndex: number) => {
		if (!table.isSelectable) {
			return;
		}

		const theme = table.roundInfo[themeIndex];

		if (theme.name.length === 0) {
			return;
		}

		appDispatch(selectTheme(themeIndex));
	};

	const getContent = (themeName: string, themeIndex: number): JSX.Element | null => {
		const isActive = themeName.length > 0;
		const isBlinking = table.activeThemeIndex === themeIndex;

		return (
			<AutoSizedText key={themeIndex} maxFontSize={144}
				className={`finalTableCell  ${isActive ? 'active' : ''} ${isBlinking ? 'blink' : ''}`}
				onClick={() => onSelectTheme(themeIndex)}>
				{isActive ? themeName : '\u00A0'}
			</AutoSizedText>
		);
	};

	const { columnCount } = getBestRowColumnCount(table.roundInfo.length);

	return (
		<div
			className={`finalTable table-content-group ${table.isSelectable ? 'selectable' : ''}`}
			style={{
				gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
				gridTemplateRows: `repeat(${Math.ceil(table.roundInfo.length / columnCount)}, 1fr)`
			}}>
			{table.roundInfo.map((theme, themeIndex) => getContent(theme.name, themeIndex))}
		</div>
	);
}
