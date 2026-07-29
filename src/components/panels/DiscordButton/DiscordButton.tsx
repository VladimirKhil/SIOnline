import * as React from 'react';
import localization from '../../../model/resources/localization';
import Link from '../../common/Link/Link';
import { useAppSelector } from '../../../state/hooks';

import './DiscordButton.css';
import discordImg from '../../../../assets/images/discord_logo.png';

const DISCORD_LINK = 'https://discord.gg/jGC4yvBEhZ';

export function DiscordButton(): JSX.Element | null {
	const clearUrls = useAppSelector(state => state.common.clearUrls);

	if (clearUrls) {
		return null;
	}

	return (
		<Link
			href={DISCORD_LINK}
			className='discordButton'
			target='_blank'
			rel='noreferrer noopener'
			title={localization.discordServer}>
			<img src={discordImg} alt='Discord' />
			<span>{localization.discordServer}</span>
		</Link>
	);
}

export default DiscordButton;
