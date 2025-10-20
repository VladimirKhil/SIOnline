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

import './GameState.scss';
import exitImg from '../../../../assets/images/exit.png';

export default function GameState(): JSX.Element {
	const appDispatch = useAppDispatch();
	const common = useAppSelector(state => state.common);
	const room = useAppSelector(state => state.room2);
	const ui = useAppSelector(state => state.ui);
	const enabledClass = common.isSIHostConnected ? '' : 'disabled';

	const onExit = () => {
		appDispatch(navigate({ navigation: { path: ui.navigation.returnToLobby ? Path.Lobby : Path.Menu }, saveState: true }));
	};

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
					</span>

					<GameProgress />

					<div className='right'>
						<QuestionCounter />
					</div>

					{room.role === Role.Showman ? <MoveRoundButton /> : null}
				</h1>
			</header>
		</div>
	);
}