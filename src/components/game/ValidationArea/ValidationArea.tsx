import * as React from 'react';
import localization from '../../../model/resources/localization';
import State from '../../../state/State';
import { connect } from 'react-redux';
import AutoSizedText from '../../common/AutoSizedText/AutoSizedText';

import './ValidationArea.scss';

interface ValidationAreaProps {
	isCompact: boolean;
	rightAnswers: string[];
	wrongAnswers: string[];
	hint: string | null;
}

const mapStateToProps = (state: State) => ({
	isCompact: state.room.validation.isCompact,
	rightAnswers: state.room.validation.rightAnswers,
	wrongAnswers: state.room.validation.wrongAnswers,
	hint: state.room.hint,
});

function getCompactView(hint: string | null): React.ReactNode {
	return <AutoSizedText className='singleAnswer' maxFontSize={50} title={localization.rightAnswer}>
		{hint}
	</AutoSizedText>;
}

export function ValidationArea(props: ValidationAreaProps): JSX.Element {
	return <div className="validationArea">
		{props.isCompact
		? getCompactView(props.hint)
		: <div className='answersPanel'>
			<div className="answers">
				<p>{localization.rightAnswers}</p>

				<ul>
					{props.rightAnswers.map((answer, index) => <li key={index}><span>{answer}</span></li>)}
				</ul>
			</div>

			<div className="answers">
				<p>{localization.wrongAnswers}</p>

				<ul>
					{props.wrongAnswers.map((answer, index) => <li key={index}><span>{answer}</span></li>)}
				</ul>
			</div>
		</div>}
	</div>;
}

export default connect(mapStateToProps)(ValidationArea);