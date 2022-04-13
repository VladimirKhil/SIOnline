import * as React from 'react';
import State from '../../state/State';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import AutoSizedText from '../common/AutoSizedText';
import ThemeInfo from '../../model/ThemeInfo';
import runActionCreators from '../../state/run/runActionCreators';

interface RoundTableProps {
	roundInfo: ThemeInfo[];
	isSelectable: boolean;
	activeThemeIndex: number;
	actionQuestionIndex: number;

	onSelectQuestion: (themeIndex: number, questionIndex: number) => void;
}

const mapStateToProps = (state: State) => ({
	roundInfo: state.run.table.roundInfo,
	isSelectable: state.run.table.isSelectable,
	activeThemeIndex: state.run.table.activeThemeIndex,
	actionQuestionIndex: state.run.table.actionQuestionIndex
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onSelectQuestion: (themeIndex: number, questionIndex: number) => {
		dispatch((runActionCreators.selectQuestion(themeIndex, questionIndex) as object) as Action);
	}
});

export class RoundTable extends React.Component<RoundTableProps> {
	constructor(props: RoundTableProps) {
		super(props);
	}

	onSelectQuestion(themeIndex: number, questionIndex: number) {
		if (!this.props.isSelectable) {
			return;
		}

		const quest = this.props.roundInfo[themeIndex].questions[questionIndex];
		if (quest === -1) {
			return;
		}

		this.props.onSelectQuestion(themeIndex, questionIndex);
	}

	render() {
		return (
			<div className={`roundTable ${this.props.isSelectable ? 'selectable' : ''}`}>
				{this.props.roundInfo.map((themeInfo, themeIndex) => {
					const className = themeIndex % 2 === 0 ? 'right' : 'left';
					const hasQuestions = themeInfo.questions.some(q => q > -1);

					return (<div key={themeIndex} className={`roundTableRow ${className}`}>
						<AutoSizedText className="roundTableCell themeHeader" maxFontSize={72}>
							{hasQuestions ? themeInfo.name : ''}
						</AutoSizedText>
						{themeInfo.questions.map((question, questionIndex) => {
							const isActive = question > -1;
							const isBlinking = themeIndex === this.props.activeThemeIndex &&
								questionIndex === this.props.actionQuestionIndex;

							return (
								<AutoSizedText key={questionIndex}
									className={`roundTableCell questHeader ${isActive ? 'active' : ''} ${isBlinking ? 'blink' : ''}`}
									maxFontSize={144} onClick={() => this.onSelectQuestion(themeIndex, questionIndex)}>
									{isActive ? question.toString() : ''}
								</AutoSizedText>
							);
						})}
					</div>);
				})}
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(RoundTable);
