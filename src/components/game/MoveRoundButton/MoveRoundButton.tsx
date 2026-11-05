import React from 'react';
import FlyoutButton, { FlyoutHorizontalOrientation, FlyoutVerticalOrientation } from '../../common/FlyoutButton/FlyoutButton';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { connect } from 'react-redux';
import State from '../../../state/State';
import localization from '../../../model/resources/localization';
import { navigateToRound } from '../../../state/serverActions';

import moveRoundImg from '../../../../assets/images/move_round.png';
import './MoveRoundButton.scss';

interface MoveRoundButtonProps {
	roundIndex: number;
}

const mapStateToProps = (state: State) => ({
	roundIndex: state.room.stage.roundIndex,
});

const MoveRoundButton: React.FC<MoveRoundButtonProps> = (props: MoveRoundButtonProps) => {
	const appDispatch = useAppDispatch();
	const isConnected = useAppSelector(state => state.common.isSIHostConnected);
	const roundsNames = useAppSelector(state => state.room2.roundsNames);

	return <FlyoutButton
			className="standard imageButton moveRoundButton"
			disabled={!isConnected || roundsNames.length < 2}
			flyout={
				<ul>
					{roundsNames?.map((name, index) => (
						<li
							key={index}
							className={index === props.roundIndex ? 'sideButtonActiveRound' : ''}
							onClick={() => appDispatch(navigateToRound(index))}
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

export default connect(mapStateToProps)(MoveRoundButton);