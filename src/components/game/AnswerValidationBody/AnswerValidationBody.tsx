import React from 'react';
import { useAppSelector } from '../../../state/hooks';
import localization from '../../../model/resources/localization';

const AnswerValidationBody: React.FC = () => {
	const validation = useAppSelector(state => state.room2.validation);

	const [firstValidationItem] = validation.queue;

	return (
		<div className='answerValidationBody'>
			<div className='answersPanel'>
				<div className="answers">
					<ul className='rightAnswers' title={localization.rightAnswers}>
						{validation.rightAnswers.map((answer, index) => <li key={index}><span>{answer}</span></li>)}
					</ul>
				</div>

				{validation.wrongAnswers.length > 0
				? <div className="answers">
						<ul className='wrongAnswers' title={localization.wrongAnswers}>
							{validation.wrongAnswers.map((answer, index) => <li key={index}><span>{answer}</span></li>)}
						</ul>
					</div>
				: null}
			</div>

			<div className='validationHeader'>
				<div className='mainMessage'>
					<p className='playerTitle'>{localization.validateAnswer}<b>{firstValidationItem.name}</b>{localization.validateAnswerEnd}</p>
					<p className='playerAnswer'>{firstValidationItem.answer}</p>
				</div>
			</div>
		</div>
	);
};

export default AnswerValidationBody;