import * as React from 'react';
import localization from '../../model/resources/localization';

import logoPng from '../../../assets/images/logo.png';

interface TableLogoProps {

}

export function TableLogo(props: TableLogoProps) {
	return (
		<div className="centerBlock logoBlock">
			<img className="inGameImg" src={logoPng} alt={localization.logo} />
		</div>
	);
}
