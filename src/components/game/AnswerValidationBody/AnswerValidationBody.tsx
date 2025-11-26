import React from 'react';
import { useAppSelector } from '../../../state/hooks';
import AutoSizedText from '../../common/AutoSizedText/AutoSizedText';
import localization from '../../../model/resources/localization';

import './AnswerValidationBody.scss';

const AnswerValidationBody: React.FC = () => {
	const validation = useAppSelector(state => state.room2.validation);

	const [firstValidationItem] = validation.queue;

	return (
		<div className='answerValidationBody'>
			<div className='answersPanel'>
				<div className="answers rightAnswersContainer" title={localization.rightAnswers}>
					<div className='answersContent'>
						<AutoSizedText maxFontSize={48} className='answersList'>
							{validation.rightAnswers.join(' · ')}
						</AutoSizedText>
					</div>
				</div>

				{validation.wrongAnswers.length > 0
				? <div className="answers wrongAnswersContainer" title={localization.wrongAnswers}>
						<div className='answersContent'>
							<AutoSizedText maxFontSize={48} className='answersList'>
								{validation.wrongAnswers.join(' · ')}
							</AutoSizedText>
						</div>
					</div>
				: null}
			</div>

			<div className='validationHeader'>
				<div className='mainMessage'>
					<AutoSizedText maxFontSize={32} className='playerAnswer' title={localization.playersAnswer}>
						{firstValidationItem.answer}
					</AutoSizedText>
				</div>
			</div>
		</div>
	);
};

export default AnswerValidationBody;