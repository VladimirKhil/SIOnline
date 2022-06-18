import * as React from 'react';
import localization from '../../model/resources/localization';

import './TableLogo.css';

export default function TableLogo() {
	return (
		<div className="centerBlock logoBlock">
			<div className='tableLogo'></div>
			<div className='tableLogoAuthor'>{localization.tableLogoAuthor}</div>
		</div>
	);
}
