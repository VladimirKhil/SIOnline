import * as React from 'react';
import AutoSizedText from '../../common/AutoSizedText/AutoSizedText';
import { useAppSelector } from '../../../state/hooks';

import './ObjectView.css';

export default function ObjectView() {
	const animate = useAppSelector((state) => state.table.animate);
	const text = useAppSelector((state) => state.table.text);
	const header = useAppSelector((state) => state.table.header);
	const rotate = useAppSelector((state) => state.table.rotate);
	const largeHeader = useAppSelector((state) => state.table.largeHeader);
	const hint = useAppSelector((state) => state.table.hint);

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
