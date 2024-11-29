import * as React from 'react';
import AutoSizedText from '../../common/AutoSizedText/AutoSizedText';
import { useAppSelector } from '../../../state/new/hooks';
import { RootState } from '../../../state/new/store';

import './ObjectView.css';

export default function ObjectView() {
	const state = useAppSelector((rootState: RootState) => rootState.table);

	return (
		<div className='objectView'>
			<div className='objectHeader'>{state.header}</div>

			<AutoSizedText
				className={`tableText tableTextCenter objectName ${state.rotate ? 'rotate' : ''}`}
				maxFontSize={144}>
				{state.text}
			</AutoSizedText>

			<div className={`objectHint ${state.hint.length === 0 ? 'empty' : ''} `}>{state.hint}</div>
		</div>
	);
}
