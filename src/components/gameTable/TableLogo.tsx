import * as React from 'react';
import localization from '../../model/resources/localization';
import Config from '../../state/Config';

// import logoPng from '../../../wwwroot/images/logo.png'; TODO: not working

interface TableLogoProps {

}

declare const config: Config;

// tslint:disable-next-line: function-name
export function TableLogo(props: TableLogoProps) {
	return (
		<div className="centerBlock logoBlock">
			<img className="inGameImg" src={`${config.rootUri}/images/logo.png`} alt={localization.logo} />
		</div>
	);
}
