import * as React from 'react';
import State from '../../../state/State';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import AutoSizedText from '../../common/AutoSizedText/AutoSizedText';
import ThemeInfo from '../../../model/ThemeInfo';
import roomActionCreators from '../../../state/room/roomActionCreators';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { AppDispatch } from '../../../state/store';

import './RoundTable.scss';
import { toggleQuestion } from '../../../state/room2Slice';

interface RoundTableProps {
	roundInfo: ThemeInfo[];
	isSelectable: boolean;
	activeThemeIndex: number;
	actionQuestionIndex: number;

	onSelectQuestion: (themeIndex: number, questionIndex: number, appDispatch: AppDispatch) => void;
}

const mapStateToProps = (state: State) => ({
	roundInfo: state.table.roundInfo,
	isSelectable: state.table.isSelectable,
	activeThemeIndex: state.table.activeThemeIndex,
	actionQuestionIndex: state.table.actionQuestionIndex,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onSelectQuestion: (themeIndex: number, questionIndex: number, appDispatch: AppDispatch) => {
		dispatch((roomActionCreators.selectQuestion(themeIndex, questionIndex, appDispatch) as object) as Action);
	},
});

export function RoundTable(props: RoundTableProps) {
	const room = useAppSelector(state => state.room2);
	const appDispatch = useAppDispatch();

	const onSelectQuestion = (themeIndex: number, questionIndex: number) => {
		if (room.isEditTableEnabled) {
			appDispatch(toggleQuestion({ themeIndex, questionIndex }));
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
					<AutoSizedText className="roundTableCell themeHeader" maxFontSize={60}>
						{hasQuestions ? themeInfo.name : ''}
					</AutoSizedText>

					{themeInfo.questions.map((question, questionIndex) => {
						const isActive = question > -1;

						const isBlinking = themeIndex === props.activeThemeIndex &&
							questionIndex === props.actionQuestionIndex;

						const questionClassName = 'roundTableCell questHeader ' +
							`${room.isEditTableEnabled ? 'editable' : ''} ${isActive ? 'active' : ''} ${isBlinking ? 'blink' : ''}`;

						// Parent div is needed for padding with percentages to work correctly
						return (
							<div key={questionIndex} className={questionClassName}>
								<AutoSizedText
									maxFontSize={144}
									onClick={() => onSelectQuestion(themeIndex, questionIndex)}>
									{isActive ? question.toString() : ''}
								</AutoSizedText>
							</div>
						);
					})}
				</div>);
			})}
		</div>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(RoundTable);
