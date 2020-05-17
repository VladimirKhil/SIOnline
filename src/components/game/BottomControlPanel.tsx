import * as React from 'react';
import { connect } from 'react-redux';
import State from '../../state/State';
import { Dispatch, Action } from 'redux';
import Role from '../../model/enums/Role';
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
	role: state.run.role,
	areStakesVisible: state.run.stakes.areVisible
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({

});

// tslint:disable-next-line: function-name
export function BottomControlPanel(props: BottomControlPanelProps) {
	return (
		<div className="game__button wide">
			{props.role === Role.Player ?
				(<div id="game__playerButton">
					<GameButton />
					<div className="answerForWide">
						<AnswerInput id="answerBoxWide" />
					</div>
					{props.areStakesVisible ? (
						<div className="wideStakeHost">
							<SendPassButton />
							<StakeSumEditor type="number" className="wideStakeHost__number checkSum" />
							<StakeSumEditor type="range" className="wideStakeHost__range" />
							<SendStakeButton />
							<SendAllInButton />
						</div>
					) : null}
				</div>) : null
			}
		</div>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(BottomControlPanel);
