import * as React from 'react';
import steamLogo from '../../../../../assets/images/steam_logo.png';

interface PersonNameProps {
	name: string;
}

export default function PersonName({ name }: PersonNameProps): JSX.Element {
	if (name.startsWith('Ⓢ')) {
		return (
			<span className="personName">
				<img src={steamLogo} alt="Steam" className="steamIcon" />
				<span>{name.substring(1)}</span>
			</span>
		);
	}

	return <span>{name}</span>;
}
