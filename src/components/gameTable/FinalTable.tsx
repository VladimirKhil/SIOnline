import * as React from 'react';
import State from '../../state/State';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import AutoSizedText from '../autoSizedText/AutoSizedText';
import ThemeInfo from '../../model/ThemeInfo';
import runActionCreators from '../../state/run/runActionCreators';

interface FinalTableProps {
	roundInfo: ThemeInfo[];
	isSelectable: boolean;
	activeThemeIndex: number;

	onSelectTheme: (themeIndex: number) => void;
}

const mapStateToProps = (state: State) => ({
	roundInfo: state.run.table.roundInfo,
	isSelectable: state.run.table.isSelectable,
	activeThemeIndex: state.run.table.activeThemeIndex
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onSelectTheme: (themeIndex: number) => {
		dispatch(runActionCreators.selectTheme(themeIndex) as object as Action);
	}
});

export class FinalTable extends React.Component<FinalTableProps> {
	constructor(props: FinalTableProps) {
		super(props);
	}

	onSelectTheme(themeIndex: number) {
		if (!this.props.isSelectable) {
			return;
		}

		const theme = this.props.roundInfo[themeIndex];
		if (theme.name.length === 0) {
			return;
		}

		this.props.onSelectTheme(themeIndex);
	}

	render() {
		return (
			<div  className={`finalTable ${this.props.isSelectable ? 'selectable' : ''}`}>
				{this.props.roundInfo.map((theme, themeIndex) => {
					const isActive = theme.name.length > 0;
					const isBlinking = this.props.activeThemeIndex === themeIndex;

					return (
						<AutoSizedText key={themeIndex} maxFontSize={144} text={isActive ? theme.name : ''}
							className={`finalTableCell  ${isActive ? 'active' : ''} ${isBlinking ? 'blink' : ''}`}
							onClick={() => this.onSelectTheme(themeIndex)} />
					);
				})}
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(FinalTable);
