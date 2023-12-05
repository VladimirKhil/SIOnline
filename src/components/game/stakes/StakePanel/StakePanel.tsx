import * as React from 'react';
import { connect } from 'react-redux';
import SendAllInButton from '../SendAllInButton';
import StakeSumEditor from '../StakeSumEditor';
import SendPassButton from '../SendPassButton';
import SendStakeButton from '../SendStakeButton';
import State from '../../../../state/State';

import './StakePanel.css';

interface StakePanelProps {
	minimum: number;
	maximum: number;
	step: number;
}

const mapStateToProps = (state: State) => ({
	minimum: state.room.stakes.minimum,
	maximum: state.room.stakes.maximum,
	step: state.room.stakes.step,
});

const MAX_EXPLICIT_STAKE_COUNT = 4;

export function StakePanel(props: StakePanelProps): JSX.Element | null {
	const stakeVariants = Math.floor((props.maximum - props.minimum) / props.step) + 1;
	const useStakeVariants = stakeVariants <= MAX_EXPLICIT_STAKE_COUNT;

	return (
		<div className="wideStakeHost">
			<SendPassButton className={useStakeVariants ? 'wideStake' : ''} />

			{useStakeVariants
			? <>
				{Array.from(Array(stakeVariants).keys()).map(n => <SendStakeButton className='wideStake' stake={props.minimum + props.step * n} />)}
			</>
			: <>
				<StakeSumEditor type="number" className="wideStakeHost__number checkSum" />
				<StakeSumEditor type="range" className="wideStakeHost__range" />
				<SendStakeButton />
			</>}

			<SendAllInButton className={useStakeVariants ? 'wideStake' : ''} />
		</div>
	);
}

export default connect(mapStateToProps)(StakePanel);