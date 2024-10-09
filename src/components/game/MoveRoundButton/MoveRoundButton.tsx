import React from 'react';
import FlyoutButton, { FlyoutHorizontalOrientation, FlyoutVerticalOrientation } from '../../common/FlyoutButton';
import { useAppSelector } from '../../../state/new/hooks';
import { connect } from 'react-redux';
import State from '../../../state/State';
import localization from '../../../model/resources/localization';
import roomActionCreators from '../../../state/room/roomActionCreators';
import { Action, Dispatch } from 'redux';

import moveRoundImg from '../../../../assets/images/move_round.png';
import './MoveRoundButton.scss';

interface MoveRoundButtonProps {
	roundsNames: string[] | null;
	roundIndex: number;
	navigateToRound: (roundIndex: number) => void;
}

const mapStateToProps = (state: State) => ({
	roundsNames: state.room.roundsNames,
	roundIndex: state.room.stage.roundIndex,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	navigateToRound: (roundIndex: number) => {
		dispatch(roomActionCreators.navigateToRound(roundIndex) as unknown as Action);
	},
});

const MoveRoundButton: React.FC<MoveRoundButtonProps> = (props: MoveRoundButtonProps) => {
	const common = useAppSelector(state => state.common);

	return <FlyoutButton
			className="standard imageButton moveRoundButton"
			disabled={!common.isSIHostConnected || !props.roundsNames || props.roundsNames.length < 2}
			flyout={
				<ul>
					{props.roundsNames?.map((name, index) => (
						<li
							key={index}
							className={index === props.roundIndex ? 'sideButtonActiveRound' : ''}
							onClick={() => props.navigateToRound(index)}
						>
							{name}
						</li>))}
				</ul>
			}
			horizontalOrientation={FlyoutHorizontalOrientation.Left}
			verticalOrientation={FlyoutVerticalOrientation.Bottom}
			alignWidth
			title={localization.gameManageHint}
		>
			<img alt='Move round' src={moveRoundImg} />
		</FlyoutButton>;
};

export default connect(mapStateToProps, mapDispatchToProps)(MoveRoundButton);