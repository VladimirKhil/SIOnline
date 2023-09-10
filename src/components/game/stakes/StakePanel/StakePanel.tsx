import * as React from 'react';
import SendAllInButton from '../SendAllInButton';
import StakeSumEditor from '../StakeSumEditor';
import SendPassButton from '../SendPassButton';
import SendStakeButton from '../SendStakeButton';

import './StakePanel.css';

export function StakePanel(): JSX.Element | null {
	return (
		<div className="wideStakeHost">
			<SendPassButton />
			<StakeSumEditor type="number" className="wideStakeHost__number checkSum" />
			<StakeSumEditor type="range" className="wideStakeHost__range" />
			<SendStakeButton />
			<SendAllInButton />
		</div>
	);
}

export default StakePanel;