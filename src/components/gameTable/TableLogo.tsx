import * as React from 'react';
import localization from '../../model/resources/localization';

// import logoPng from '../../../wwwroot/images/logo.png'; TODO: not working

interface TableLogoProps {

}

// tslint:disable-next-line: function-name
export function TableLogo(props: TableLogoProps) {
	return (
		<div className="centerBlock logoBlock">
			<img className="inGameImg" src="/images/logo.png" alt={localization.logo} />
		</div>
	);
}
