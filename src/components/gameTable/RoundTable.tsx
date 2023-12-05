import * as React from 'react';
import State from '../../state/State';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import AutoSizedText from '../common/AutoSizedText';
import ThemeInfo from '../../model/ThemeInfo';
import roomActionCreators from '../../state/room/roomActionCreators';

import './RoundTable.css';

interface RoundTableProps {
	roundInfo: ThemeInfo[];
	isSelectable: boolean;
	activeThemeIndex: number;
	actionQuestionIndex: number;
	isEditEnabled: boolean;

	onSelectQuestion: (themeIndex: number, questionIndex: number) => void;
	onToggleQuestion: (themeIndex: number, questionIndex: number) => void;
}

const mapStateToProps = (state: State) => ({
	roundInfo: state.table.roundInfo,
	isSelectable: state.table.isSelectable,
	activeThemeIndex: state.table.activeThemeIndex,
	actionQuestionIndex: state.table.actionQuestionIndex,
	isEditEnabled: state.room.stage.isEditEnabled,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onSelectQuestion: (themeIndex: number, questionIndex: number) => {
		dispatch((roomActionCreators.selectQuestion(themeIndex, questionIndex) as object) as Action);
	},
	onToggleQuestion: (themeIndex: number, questionIndex: number) => {
		dispatch((roomActionCreators.toggleQuestion(themeIndex, questionIndex) as object) as Action);
	},
});

export class RoundTable extends React.Component<RoundTableProps> {
	onSelectQuestion(themeIndex: number, questionIndex: number) {
		if (this.props.isEditEnabled) {
			this.props.onToggleQuestion(themeIndex, questionIndex);
			return;
		}

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

							const questionClassName = 'roundTableCell questHeader ' +
								`${this.props.isEditEnabled ? 'editable' : ''} ${isActive ? 'active' : ''} ${isBlinking ? 'blink' : ''}`;

							return (
								<AutoSizedText
									key={questionIndex}
									className={questionClassName}
									maxFontSize={144}
									onClick={() => this.onSelectQuestion(themeIndex, questionIndex)}>
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
