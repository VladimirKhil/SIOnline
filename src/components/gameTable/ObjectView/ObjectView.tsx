import * as React from 'react';
import AutoSizedText from '../../common/AutoSizedText/AutoSizedText';
import { useAppSelector } from '../../../state/hooks';
import { RootState } from '../../../state/store';

import './ObjectView.css';

export default function ObjectView() {
	const state = useAppSelector((rootState: RootState) => rootState.table);

	return (
		<div className={`objectView ${state.animate ? 'animate' : ''}`} key={state.text}>
			<div className={`objectHeader ${state.header.length === 0 ? 'empty' : ''}`}>{state.header}</div>

			<AutoSizedText
				className={`tableText tableTextCenter objectName ${state.rotate ? 'rotate' : ''}`}
				maxFontSize={state.largeHeader ? 216 : 144}>
				{state.text}
			</AutoSizedText>

			<div className={`objectHint ${state.hint.length === 0 ? 'empty' : ''}`}>{state.hint}</div>
		</div>
	);
}
