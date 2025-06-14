import * as React from 'react';
import State from '../../../state/State';
import { connect } from 'react-redux';
import AutoSizedText from '../../common/AutoSizedText/AutoSizedText';
import ThemeInfo from '../../../model/ThemeInfo';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { toggleQuestion } from '../../../state/room2Slice';
import { selectQuestion } from '../../../state/serverActions';

import './RoundTable.scss';

interface RoundTableProps {
	roundInfo: ThemeInfo[];
	isSelectable: boolean;
	activeThemeIndex: number;
	actionQuestionIndex: number;
}

const mapStateToProps = (state: State) => ({
	roundInfo: state.table.roundInfo,
	isSelectable: state.table.isSelectable,
	activeThemeIndex: state.table.activeThemeIndex,
	actionQuestionIndex: state.table.actionQuestionIndex,
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

		appDispatch(selectQuestion({ themeIndex, questionIndex }));
	};

	return (
		<div className={`roundTable ${props.isSelectable ? 'selectable' : ''}`}>
			{props.roundInfo.map((themeInfo, themeIndex) => {
				const className = themeIndex % 2 === 0 ? 'right' : 'left';
				const hasQuestions = themeInfo.questions.some(q => q > -1);

				return (<div key={themeIndex} className={`roundTableRow ${className}`}>
					<div className="roundTableCell themeHeader">
						<AutoSizedText minFontSize={8} maxFontSize={60}>
							{hasQuestions ? themeInfo.name : ''}
						</AutoSizedText>
					</div>

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
									minFontSize={8}
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

export default connect(mapStateToProps)(RoundTable);
