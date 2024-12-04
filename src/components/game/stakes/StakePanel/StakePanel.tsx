import * as React from 'react';
import { connect } from 'react-redux';
import SendAllInButton from '../SendAllInButton';
import StakeSumEditor from '../StakeSumEditor';
import SendPassButton from '../SendPassButton';
import SendStakeButton from '../SendStakeButton';
import State from '../../../../state/State';
import StakeModes from '../../../../client/game/StakeModes';

import './StakePanel.scss';

interface StakePanelProps {
	minimum: number;
	maximum: number;
	step: number;
	stakeModes: StakeModes;
}

const mapStateToProps = (state: State) => ({
	minimum: state.room.stakes.minimum,
	maximum: state.room.stakes.maximum,
	step: state.room.stakes.step,
	stakeModes: state.room.stakes.stakeModes,
});

const MAX_EXPLICIT_STAKE_COUNT = 4;

export function StakePanel(props: StakePanelProps): JSX.Element | null {
	const stakeVariants = Math.floor((props.maximum - props.minimum) / props.step) + 1;
	const useStakeVariants = stakeVariants <= MAX_EXPLICIT_STAKE_COUNT && (props.stakeModes & StakeModes.Stake);

	return (
		<div className="wideStakeHost">
			<SendPassButton className={`standard ${useStakeVariants ? 'wideStake' : ''}`} />

			{useStakeVariants
			? <>
				{Array.from(Array(stakeVariants).keys()).map(n => <SendStakeButton
					className='wideStake mainAction active'
					stake={props.minimum + props.step * n} />)}
			</>
			: <>
				<StakeSumEditor type="number" className="wideStakeHost__number checkSum" />
				<StakeSumEditor type="range" className="wideStakeHost__range" />
				<SendStakeButton />
			</>}

			<SendAllInButton className={`mainAction active ${useStakeVariants ? 'wideStake' : ''}`} />
		</div>
	);
}

export default connect(mapStateToProps)(StakePanel);