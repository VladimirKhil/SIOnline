import * as React from 'react';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import AutoSizedText from '../../common/AutoSizedText/AutoSizedText';
import roomActionCreators from '../../../state/room/roomActionCreators';
import { AppDispatch, RootState } from '../../../state/new/store';
import { useAppDispatch, useAppSelector } from '../../../state/new/hooks';

import './FinalTable.scss';

interface FinalTableProps {
	onSelectTheme: (themeIndex: number, appDispatch: AppDispatch) => void;
}

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onSelectTheme: (themeIndex: number, appDispatch: AppDispatch) => {
		dispatch(roomActionCreators.selectTheme(themeIndex, appDispatch) as object as Action);
	},
});

export function FinalTable(props: FinalTableProps) {
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

		props.onSelectTheme(themeIndex, appDispatch);
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

export default connect(null, mapDispatchToProps)(FinalTable);
