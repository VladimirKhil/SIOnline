import * as React from 'react';
import AutoSizedText from '../../common/AutoSizedText/AutoSizedText';
import { RootState } from '../../../state/store';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { selectTheme } from '../../../state/serverActions';
import getBestRowColumnCount from '../../../utils/stackedContentHelper';
import { shallowEqual } from 'react-redux';

import './ThemeStack.scss';

export default function ThemeStack() {
	const prevProps = React.useRef<{ isSelectable: boolean; roundInfo: any[]; activeThemeIndex: number }>();

	const { isSelectable, roundInfo, activeThemeIndex } = useAppSelector(
        (rootState: RootState) => ({
            isSelectable: rootState.table.isSelectable,
            roundInfo: rootState.table.roundInfo,
            activeThemeIndex: rootState.table.activeThemeIndex
        }),
        shallowEqual
    );

	React.useEffect(() => {
		prevProps.current = { isSelectable, roundInfo, activeThemeIndex };
	}, [isSelectable, roundInfo, activeThemeIndex]);

	const appDispatch = useAppDispatch();

	const onSelectTheme = React.useCallback((themeIndex: number) => {
		if (!isSelectable) {
			return;
		}

		const theme = roundInfo[themeIndex];

		if (theme.name.length === 0) {
			return;
		}

		appDispatch(selectTheme(themeIndex));
	}, [isSelectable, roundInfo, appDispatch]);

	const getContent = (themeName: string, themeIndex: number): JSX.Element | null => {
		const isActive = themeName.length > 0;
		const isBlinking = activeThemeIndex === themeIndex;

		return (
			<AutoSizedText key={themeIndex} maxFontSize={144}
				className={`finalTableCell  ${isActive ? 'active' : ''} ${isBlinking ? 'blink' : ''}`}
				onClick={() => onSelectTheme(themeIndex)}>
				{isActive ? themeName : '\u00A0'}
			</AutoSizedText>
		);
	};

	const { columnCount } = getBestRowColumnCount(roundInfo.length);

	return (
		<div
			className={`finalTable table-content-group ${isSelectable ? 'selectable' : ''}`}
			style={{
				gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
				gridTemplateRows: `repeat(${Math.ceil(roundInfo.length / columnCount)}, 1fr)`
			}}>
			{roundInfo.map((theme, themeIndex) => getContent(theme.name, themeIndex))}
		</div>
	);
}
