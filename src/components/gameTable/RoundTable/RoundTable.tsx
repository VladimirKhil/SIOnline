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
	isHexagonal: boolean;
}

const mapStateToProps = (state: State) => ({
	roundInfo: state.table.roundInfo,
	isSelectable: state.table.isSelectable,
	activeThemeIndex: state.table.activeThemeIndex,
	actionQuestionIndex: state.table.actionQuestionIndex,
	isHexagonal: state.settings.theme.table.isHexagonal || false,
});

export function RoundTable(props: RoundTableProps) {
	const room = useAppSelector(state => state.room2);
	const appDispatch = useAppDispatch();

	// Toggles all theme questions: hides available questions on click and restores them on a repeated click until another element is edited.
	const [themeMemory, setThemeMemory] = React.useState<{ themeIndex: number; indices: number[] } | null>(null);

	const onThemeHeaderClick = (themeIndex: number) => {
		if (!room.isEditTableEnabled) {
			return;
		}

		if (themeMemory?.themeIndex === themeIndex) {
			themeMemory.indices.forEach(questionIndex => {
				appDispatch(toggleQuestion({ themeIndex, questionIndex }));
			});
			setThemeMemory(null);
			return;
		}

		const indices = props.roundInfo[themeIndex].questions
			.map((q, idx) => (q > -1 ? idx : -1))
			.filter(idx => idx > -1);

		if (indices.length === 0) {
			setThemeMemory(null);
			return;
		}

		indices.forEach(questionIndex => {
			appDispatch(toggleQuestion({ themeIndex, questionIndex }));
		});

		setThemeMemory({ themeIndex, indices });
	};

	const onSelectQuestion = (themeIndex: number, questionIndex: number) => {
		setThemeMemory(null);

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
		<div className={`roundTable ${props.isSelectable ? 'selectable' : ''} ${props.isHexagonal ? 'hexagonal' : ''}`}>
			{props.roundInfo.map((themeInfo, themeIndex) => {
				const className = themeIndex % 2 === 0 ? 'right' : 'left';
				const hasQuestions = themeInfo.questions.some(q => q > -1);

				const isRemembered = themeMemory?.themeIndex === themeIndex;
				const isThemeEditable = room.isEditTableEnabled && (hasQuestions || isRemembered);
				const themeClassName = `roundTableCell themeHeader ${isThemeEditable ? 'editable' : ''} ${hasQuestions ? 'active' : ''}`;

				return (<div key={themeIndex} className={`roundTableRow ${className}`}>
					<div
						className={themeClassName}
						onClick={() => onThemeHeaderClick(themeIndex)}>
						<AutoSizedText minFontSize={8} maxFontSize={60}>
							{hasQuestions ? themeInfo.name : ''}
						</AutoSizedText>
					</div>

					{props.isHexagonal && themeIndex % 2 === 1 ? <div className="hexSpacer" /> : null}

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

					{props.isHexagonal && themeIndex % 2 === 0 ? <div className="hexSpacer" /> : null}
				</div>);
			})}
		</div>
	);
}

export default connect(mapStateToProps)(RoundTable);
