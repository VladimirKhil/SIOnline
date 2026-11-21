import * as React from 'react';
import AuthSource from '../../../../client/contracts/AuthSource';
import Account from '../../../../client/models/Account';
import Link from '../../../common/Link/Link';
import steamLogo from '../../../../../assets/images/steam_logo.png';

interface PersonNameProps {
	name: string;
	account?: Account | null;
}

export default function PersonName({ name, account }: PersonNameProps): JSX.Element {
	const renderedName = name.startsWith('Ⓢ')
		? (
			<span className="personName">
				<img src={steamLogo} alt="Steam" className="steamIcon" />
				<span>{name.substring(1)}</span>
			</span>
		)
		: <span>{name}</span>;

	if (account?.authProvider === AuthSource.Steam && account.userId) {
		return (
			<span onClick={e => e.stopPropagation()}>
				<Link
					className='personProfileLink'
					href={`https://steamcommunity.com/profiles/${account.userId}`}
					target='_blank'
					rel='noopener noreferrer'
				>
					{renderedName}
				</Link>
			</span>
		);
	}

	return renderedName;
}
