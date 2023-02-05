import * as React from 'react';
import { connect } from 'react-redux';
import State from '../../state/State';
import Role from '../../client/contracts/Role';
import GameButton from './GameButton';
import AnswerInput from './AnswerInput';
import StakeSumEditor from './stakes/StakeSumEditor';
import SendPassButton from './stakes/SendPassButton';
import SendStakeButton from './stakes/SendStakeButton';
import SendAllInButton from './stakes/SendAllInButton';

import './BottomControlPanel.css';

interface BottomControlPanelProps {
	role: Role;
	areStakesVisible: boolean;
}

const mapStateToProps = (state: State) => ({
	role: state.room.role,
	areStakesVisible: state.room.stakes.areVisible,
});

export function BottomControlPanel(props: BottomControlPanelProps) {
	return (
		<div className="bottomPanel wide">
			{props.role === Role.Player ? (
				<div className="game__playerButton">
					<GameButton />

					<div className="answerForWide">
						<AnswerInput id="answerBoxWide" />
					</div>
				</div>) : null
			}

			{props.areStakesVisible ? (
				<div className="wideStakeHost">
					<SendPassButton />
					<StakeSumEditor type="number" className="wideStakeHost__number checkSum" />
					<StakeSumEditor type="range" className="wideStakeHost__range" />
					<SendStakeButton />
					<SendAllInButton />
				</div>
			) : null}
		</div>
	);
}

export default connect(mapStateToProps)(BottomControlPanel);
