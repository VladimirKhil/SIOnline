import * as React from 'react';
import AutoSizedText from '../../common/AutoSizedText/AutoSizedText';
import { useAppSelector } from '../../../state/hooks';
import { RootState } from '../../../state/store';

import './ObjectView.css';

export default function ObjectView() {
	const { animate, text, header, rotate, largeHeader, hint } = useAppSelector((rootState: RootState) => ({
		animate: rootState.table.animate,
		text: rootState.table.text,
		header: rootState.table.header,
		rotate: rootState.table.rotate,
		largeHeader: rootState.table.largeHeader,
		hint: rootState.table.hint,
	}));

	return (
		<div className={`objectView ${animate ? 'animate' : ''}`} key={text}>
			<div className={`objectHeader ${header.length === 0 ? 'empty' : ''}`}>{header}</div>

			<AutoSizedText
				className={`tableText tableTextCenter objectName ${rotate ? 'rotate' : ''}`}
				maxFontSize={largeHeader ? 216 : 144}>
				{text}
			</AutoSizedText>

			<div className={`objectHint ${hint.length === 0 ? 'empty' : ''}`}>{hint}</div>
		</div>
	);
}
