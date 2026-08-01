import React from 'react';
import { useAppSelector } from '../../../state/hooks';
import AutoSizedText from '../../common/AutoSizedText/AutoSizedText';
import ClickableAnswer from '../../common/ClickableAnswer/ClickableAnswer';
import localization from '../../../model/resources/localization';

import './AnswerValidationBody.scss';

function getAnswers(answers: string[]): React.ReactNode {
	return answers.map((answer, index) => <React.Fragment key={index}>
		{index > 0 ? ' · ' : null}
		<ClickableAnswer text={answer} />
	</React.Fragment>);
}

const AnswerValidationBody: React.FC = () => {
	const validation = useAppSelector(state => state.room2.validation);

	const [firstValidationItem] = validation.queue;

	return (
		<div className='answerValidationBody'>
			<div className='answersPanel'>
				<div className="answers rightAnswersContainer" title={localization.rightAnswers}>
					<div className='answersContent'>
						<AutoSizedText maxFontSize={48} className='answersList'>
							{getAnswers(validation.rightAnswers)}
						</AutoSizedText>
					</div>
				</div>

				{validation.wrongAnswers.length > 0
				? <div className="answers wrongAnswersContainer" title={localization.wrongAnswers}>
						<div className='answersContent'>
							<AutoSizedText maxFontSize={48} className='answersList'>
								{getAnswers(validation.wrongAnswers)}
							</AutoSizedText>
						</div>
					</div>
				: null}
			</div>

			<div className='validationHeader'>
				<div className='mainMessage'>
					<AutoSizedText maxFontSize={32} className='answererName'>
						{localization.playerAnswerLabel.replace('{0}', firstValidationItem.name)}
					</AutoSizedText>
					<AutoSizedText maxFontSize={32} className='playerAnswer' title={localization.playersAnswer}>
						<ClickableAnswer text={firstValidationItem.answer} />
					</AutoSizedText>
				</div>
			</div>
		</div>
	);
};

export default AnswerValidationBody;