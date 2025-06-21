import * as React from 'react';
import AutoSizedText from '../../common/AutoSizedText/AutoSizedText';
import { RootState } from '../../../state/store';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { selectTheme } from '../../../state/serverActions';

import './FinalTable.scss';

export default function FinalTable() {
	const state = useAppSelector((rootState: RootState) => rootState.table);
	const appDispatch = useAppDispatch();

	const onSelectTheme = (themeIndex: number) => {
		if (!state.isSelectable) {
			return;
		}

		const theme = state.roundInfo[themeIndex];

		if (theme.name.length === 0) {
			return;
		}

		appDispatch(selectTheme(themeIndex));
	};

	return (
		<div className={`finalTable ${state.isSelectable ? 'selectable' : ''}`}>
			{state.roundInfo.map((theme, themeIndex) => {
				const isActive = theme.name.length > 0;
				const isBlinking = state.activeThemeIndex === themeIndex;

				return (
					<AutoSizedText key={themeIndex} maxFontSize={144}
						className={`finalTableCell  ${isActive ? 'active' : ''} ${isBlinking ? 'blink' : ''}`}
						onClick={() => onSelectTheme(themeIndex)}>
						{isActive ? theme.name : ''}
					</AutoSizedText>
				);
			})}
		</div>
	);
}
