import * as React from 'react';
import State from '../../../state/State';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import AutoSizedText from '../../common/AutoSizedText/AutoSizedText';
import ThemeInfo from '../../../model/ThemeInfo';
import roomActionCreators from '../../../state/room/roomActionCreators';
import { useAppDispatch } from '../../../state/new/hooks';
import { AppDispatch } from '../../../state/new/store';

import './RoundTable.scss';

interface RoundTableProps {
	roundInfo: ThemeInfo[];
	isSelectable: boolean;
	activeThemeIndex: number;
	actionQuestionIndex: number;
	isEditEnabled: boolean;

	onSelectQuestion: (themeIndex: number, questionIndex: number, appDispatch: AppDispatch) => void;
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
	onSelectQuestion: (themeIndex: number, questionIndex: number, appDispatch: AppDispatch) => {
		dispatch((roomActionCreators.selectQuestion(themeIndex, questionIndex, appDispatch) as object) as Action);
	},
	onToggleQuestion: (themeIndex: number, questionIndex: number) => {
		dispatch((roomActionCreators.toggleQuestion(themeIndex, questionIndex) as object) as Action);
	},
});

export function RoundTable(props: RoundTableProps) {
	const appDispatch = useAppDispatch();

	const onSelectQuestion = (themeIndex: number, questionIndex: number) => {
		if (props.isEditEnabled) {
			props.onToggleQuestion(themeIndex, questionIndex);
			return;
		}

		if (!props.isSelectable) {
			return;
		}

		const quest = props.roundInfo[themeIndex].questions[questionIndex];

		if (quest === -1) {
			return;
		}

		props.onSelectQuestion(themeIndex, questionIndex, appDispatch);
	};

	return (
		<div className={`roundTable ${props.isSelectable ? 'selectable' : ''}`}>
			{props.roundInfo.map((themeInfo, themeIndex) => {
				const className = themeIndex % 2 === 0 ? 'right' : 'left';
				const hasQuestions = themeInfo.questions.some(q => q > -1);

				return (<div key={themeIndex} className={`roundTableRow ${className}`}>
					<AutoSizedText className="roundTableCell themeHeader" maxFontSize={72}>
						{hasQuestions ? themeInfo.name : ''}
					</AutoSizedText>

					{themeInfo.questions.map((question, questionIndex) => {
						const isActive = question > -1;

						const isBlinking = themeIndex === props.activeThemeIndex &&
							questionIndex === props.actionQuestionIndex;

						const questionClassName = 'roundTableCell questHeader ' +
							`${props.isEditEnabled ? 'editable' : ''} ${isActive ? 'active' : ''} ${isBlinking ? 'blink' : ''}`;

						return (
							<AutoSizedText
								key={questionIndex}
								className={questionClassName}
								maxFontSize={144}
								onClick={() => onSelectQuestion(themeIndex, questionIndex)}>
								{isActive ? question.toString() : ''}
							</AutoSizedText>
						);
					})}
				</div>);
			})}
		</div>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(RoundTable);
