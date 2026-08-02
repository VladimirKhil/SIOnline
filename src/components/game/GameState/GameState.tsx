import React from 'react';
import localization from '../../../model/resources/localization';
import FlyoutButton, { FlyoutHorizontalOrientation, FlyoutTheme, FlyoutVerticalOrientation } from '../../common/FlyoutButton/FlyoutButton';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import GameProgress from '../GameProgress/GameProgress';
import MoveRoundButton from '../MoveRoundButton/MoveRoundButton';
import QuestionCounter from '../QuestionCounter/QuestionCounter';
import Role from '../../../model/Role';
import Path from '../../../model/enums/Path';
import { navigate } from '../../../utils/Navigator';
import Constants from '../../../model/enums/Constants';

import './GameState.scss';
import exitImg from '../../../../assets/images/exit.png';

export default function GameState(): JSX.Element {
	const appDispatch = useAppDispatch();
	const role = useAppSelector(state => state.room2.role);
	const navigation = useAppSelector(state => state.ui.navigation);
	const demoButtonHighlights = useAppSelector(state => state.room2.demoButtonHighlights);
	const deepMode = useAppSelector(state => state.room2.deepMode);
	const playerCount = useAppSelector(state => state.room2.persons.playerCount);
	const windowWidth = useAppSelector(state => state.ui.windowWidth);
	const showArenaPlayerCount = deepMode && windowWidth >= Constants.WIDE_WINDOW_WIDTH;

	const onExit = () => {
		appDispatch(navigate({ navigation: { path: navigation.returnToLobby ? Path.Lobby : Path.Menu }, saveState: true }));
	};

	return (
		<div className='gameState'>
			<header>
				<h1>
					<span className='left'>
						<div className='leftControls'>
							<FlyoutButton
								className={`standard welcomeExit ${demoButtonHighlights.leaveRoom ? 'demoHighlighted' : ''}`}
								title={localization.exit}
								flyout={(
									<div id="exitMenu" className="exitMenu">
										<div id="exitMenuPopup" className="gameMenuPopup">
											<p>{localization.exitConfirmation}</p>
											<ul>
												<li
													onClick={onExit}>
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

							{showArenaPlayerCount ? (
								<div className='arenaPlayerCount' title={localization.players}>
									<svg width='16' height='16' viewBox='0 0 24 24' aria-hidden='true'>
										<path
											d='M12 12C9.79 12 8 10.21 8 8C8 5.79 9.79 4 12 4C14.21 4 16 5.79 16 8C16 10.21 14.21 12 12 12Z'
											fill='currentColor'
										/>
										<path
											d='M4 20C4 16.69 7.13 14 12 14C16.87 14 20 16.69 20 20V21H4V20Z'
											fill='currentColor'
										/>
									</svg>
									<span>{playerCount}</span>
								</div>
							) : null}
						</div>
					</span>

					<GameProgress />

					<div className='right'>
						<QuestionCounter />
					</div>

					{role === Role.Showman ? <MoveRoundButton /> : null}
				</h1>
			</header>
		</div>
	);
}