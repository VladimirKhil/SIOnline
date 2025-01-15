import React, { Dispatch } from 'react';
import localization from '../../../model/resources/localization';
import FlyoutButton, { FlyoutHorizontalOrientation, FlyoutTheme, FlyoutVerticalOrientation } from '../../common/FlyoutButton/FlyoutButton';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { connect } from 'react-redux';
import { AppDispatch } from '../../../state/store';
import { Action } from 'redux';
import roomActionCreators from '../../../state/room/roomActionCreators';
import GameProgress from '../GameProgress/GameProgress';
import MoveRoundButton from '../MoveRoundButton/MoveRoundButton';
import State from '../../../state/State';
import Role from '../../../model/Role';

import './GameState.scss';
import exitImg from '../../../../assets/images/exit.png';

interface GameStateProps {
	role: Role;
	onExit: (appDispatch: AppDispatch) => void;
}

const mapStateToProps = (state: State) => ({
	role: state.room.role,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onExit: (appDispatch: AppDispatch) => {
		dispatch(roomActionCreators.exitGame(appDispatch) as unknown as Action);
	},
});

const GameState: React.FC<GameStateProps> = (props: GameStateProps) => {
	const appDispatch = useAppDispatch();
	const common = useAppSelector(state => state.common);
	const enabledClass = common.isSIHostConnected ? '' : 'disabled';

	return (
		<div className='gameState'>
			<header>
				<h1>
					<span className='left'>
						<FlyoutButton
							className="standard welcomeExit"
							title={localization.exit}
							flyout={(
								<div id="exitMenu" className="exitMenu">
									<div id="exitMenuPopup" className="gameMenuPopup">
										<p>{localization.exitConfirmation}</p>
										<ul>
											<li
												className={enabledClass}
												onClick={() => props.onExit(appDispatch)}>
												{localization.exitFromGame}
											</li>
										</ul>
									</div>
								</div>
							)}
							theme={FlyoutTheme.Dark}
							alignWidth
							verticalOrientation={FlyoutVerticalOrientation.Bottom}
							horizontalOrientation={FlyoutHorizontalOrientation.Right}
						>
							<img alt='exit' src={exitImg} />
						</FlyoutButton>
					</span>

					<GameProgress />
					{props.role === Role.Showman ? <MoveRoundButton /> : null}
				</h1>
			</header>
		</div>
	);
};

export default connect(mapStateToProps, mapDispatchToProps)(GameState);