import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import gameActionCreators from '../state/game/gameActionCreators';
import localization from '../model/resources/localization';
import Dialog from './common/Dialog';
import ProgressBar from './common/ProgressBar';
import State from '../state/State';
import Role from '../model/Role';
import Constants from '../model/enums/Constants';
import PackageType from '../model/enums/PackageType';
import SIStorageDialog from './SIStorageDialog';
import FlyoutButton, { FlyoutTheme } from './common/FlyoutButton';
import uiActionCreators from '../state/ui/uiActionCreators';
import onlineActionCreators from '../state/online/onlineActionCreators';
import isWindowsOS from '../utils/isWindowsOS';
import PackageFileSelector from './PackageFileSelector';
import { INavigationState } from '../state/ui/UIState';

import './NewGameDialog.css';

interface NewGameDialogProps {
	isConnected: boolean;
	isSingleGame: boolean;
	gameName: string;
	gamePassword: string;
	isOralGame: boolean;
	gameVoiceChat: string;
	gamePackageType: PackageType;
	gamePackageName: string;
	gamePackageData: File | null;
	gameRole: Role;
	isShowmanHuman: boolean;
	playersCount: number;
	humanPlayersCount: number;
	inProgress: boolean;
	error: string | null;
	uploadPackageProgress: boolean;
	uploadPackagePercentage: number;
	navigation: INavigationState;
	clearUrls?: boolean;

	onGameNameChanged: (newGameName: string) => void;
	onGamePasswordChanged: (newGamePassword: string) => void;
	onGameVoiceChatChanged: (newVoiceChat: string) => void;
	onGamePackageTypeChanged: (type: PackageType) => void;
	onGamePackageDataChanged: (name: string, data: File | null) => void;
	onGamePackageLibraryChanged: (id: string, name: string, uri: string) => void;
	onGameRoleChanged: (newGameRole: Role) => void;
	showmanTypeChanged: (isHuman: boolean) => void;
	onPlayersCountChanged: (gamePlayersCount: number) => void;
	onHumanPlayersCountChanged: (gameHumanPlayersCount: number) => void;
	onCreate: (isSingleGame: boolean) => void;
	onShowSettings: () => void;
	onClose: () => void;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isConnected,
	gameName: state.game.name,
	gamePassword: state.game.password,
	isOralGame: state.settings.appSettings.oral,
	gameVoiceChat: state.game.voiceChat,
	gamePackageType: state.game.package.type,
	gamePackageName: state.game.package.name,
	gamePackageData: state.game.package.data,
	gameRole: state.game.role,
	isShowmanHuman: state.game.isShowmanHuman,
	playersCount: state.game.playersCount,
	humanPlayersCount: state.game.humanPlayersCount,
	inProgress: state.online.gameCreationProgress,
	error: state.online.gameCreationError,
	uploadPackageProgress:  state.online.uploadPackageProgress,
	uploadPackagePercentage: state.online.uploadPackagePercentage,
	navigation: state.ui.navigation,
	clearUrls: state.common.clearUrls,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onGameNameChanged: (newGameName: string) => {
		dispatch(gameActionCreators.gameNameChanged(newGameName));
	},
	onGamePasswordChanged: (newGamePassword: string) => {
		dispatch(gameActionCreators.gamePasswordChanged(newGamePassword));
	},
	onGameVoiceChatChanged: (newVoiceChat: string) => {
		dispatch(gameActionCreators.gameVoiceChatChanged(newVoiceChat));
	},
	onGamePackageTypeChanged: (type: PackageType) => {
		dispatch(gameActionCreators.gamePackageTypeChanged(type));
	},
	onGamePackageDataChanged: (name: string, data: File | null) => {
		dispatch(gameActionCreators.gamePackageDataChangedRequest(name, data) as unknown as Action);
	},
	onGamePackageLibraryChanged: (id: string, name: string, uri: string) => {
		dispatch(gameActionCreators.gamePackageLibraryChanged(id, name, uri));
	},
	onGameRoleChanged: (newGameRole: Role) => {
		dispatch(gameActionCreators.gameRoleChanged(newGameRole));
	},
	showmanTypeChanged: (isHuman: boolean) => {
		dispatch(gameActionCreators.showmanTypeChanged(isHuman));
	},
	onPlayersCountChanged: (playersCount: number) => {
		dispatch(gameActionCreators.playersCountChanged(playersCount));
	},
	onHumanPlayersCountChanged: (humanPlayersCount: number) => {
		dispatch(gameActionCreators.humanPlayersCountChanged(humanPlayersCount));
	},
	onShowSettings: () => {
		dispatch(uiActionCreators.showSettings(true));
	},
	onCreate: (isSingleGame: boolean) => {
		dispatch(onlineActionCreators.createNewGame(isSingleGame) as unknown as Action);
	},
});

function getPackageName(packageType: PackageType, packageName: string, packageData: File | null): string {
	switch (packageType) {
		case PackageType.Random:
			return localization.randomThemes;

		case PackageType.File:
			return packageData?.name ?? packageName;

		default:
			return packageName;
	}
}

export function NewGameDialog(props: NewGameDialogProps) {
	const [isSIStorageOpen, setIsSIStorageOpen] = React.useState(false);
	const childRef = React.useRef<HTMLInputElement>(null);

	React.useEffect(() => {
		if (props.navigation.packageUri) {
			props.onGamePackageTypeChanged(PackageType.SIStorage);
			props.onGamePackageLibraryChanged('', props.navigation.packageName ?? props.navigation.packageUri, props.navigation.packageUri);
		}
	});

	const onFilePackageSelected = () => {
		if (childRef.current) {
			childRef.current.click();
		}
	};

	const onGameNameChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
		props.onGameNameChanged(e.target.value);
	};

	const onGamePasswordChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
		props.onGamePasswordChanged(e.target.value);
	};

	const onGameVoiceChatChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
		props.onGameVoiceChatChanged(e.target.value);
	};

	const onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === Constants.KEY_ENTER_NEW) {
			props.onCreate(props.isSingleGame);
		}
	};

	const onRandomThemesSelected = () => {
		props.onGamePackageTypeChanged(PackageType.Random);
	};

	const onGameRoleChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
		props.onGameRoleChanged(parseInt(e.target.value, 10));
	};

	const onShowmanTypeChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
		props.showmanTypeChanged(parseInt(e.target.value, 10) === 1);
	};

	const onPlayersCountChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
		props.onPlayersCountChanged(parseInt(e.target.value, 10));
	};

	const onHumanPlayersCountChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
		props.onHumanPlayersCountChanged(parseInt(e.target.value, 10));
	};

	const onSelectSIPackage = async (id: string, name: string, uri: string) => {
		setIsSIStorageOpen(false);

		props.onGamePackageTypeChanged(PackageType.SIStorage);
		props.onGamePackageLibraryChanged(id, name, uri);
	};

	const humanPlayersMaxCount = props.playersCount - (props.gameRole === Role.Player ? 1 : 0);
	const botsCount = Math.max(0, humanPlayersMaxCount - props.humanPlayersCount);

	return (
		<>
			<Dialog id="newGameDialog" title={localization.newGame} onClose={props.onClose}>
				<div className="settings">
					{props.isSingleGame ? null : (
						<>
							<p>{localization.gameName}</p>

							<input
								type="text"
								value={props.gameName}
								onChange={onGameNameChanged}
								onKeyPress={onKeyPress}
							/>

							<p>{localization.password}</p>

							<input
								aria-label='Password'
								type="password"
								value={props.gamePassword}
								onChange={onGamePasswordChanged}
								onKeyPress={onKeyPress}
							/>

							{props.isOralGame ? (
								<>
									<p>{localization.voiceChat}</p>

									<input
										aria-label='Voice chat url'
										type="text"
										value={props.gameVoiceChat}
										onChange={onGameVoiceChatChanged}
									/>
								</>
							) : null}
						</>
					)}

					<p className='newGameHeader'>{localization.questionPackage}</p>

					<div className='packageSelector'>
						<FlyoutButton
							theme={FlyoutTheme.Dark}
							flyout={
								<ul className='packageSources'>
									<li onClick={onRandomThemesSelected}>{localization.randomThemes}</li>
									<li onClick={onFilePackageSelected}>{`${localization.file}…`}</li>
									<li onClick={() => setIsSIStorageOpen(true)}>{`${localization.libraryTitle}…`}</li>

									{!props.clearUrls && localization.userPackages.length > 0
									? <>
										<li>
											<a
												className='simpleLink'
												href="https://vk.com/topic-135725718_34975471"
												target='_blank'
												rel='noopener noreferrer'>
												{`${localization.userPackages}…`}
											</a>
										</li>

										<li>
											<a
												className='simpleLink'
												href="https://sigame.ru"
												target='_blank'
												rel='noopener noreferrer'>
												{`${localization.library} sigame.ru…`}
											</a>
										</li>

										<li>
											<a
												className='simpleLink'
												href="https://sigame.xyz"
												target='_blank'
												rel='noopener noreferrer'>
												{`${localization.library} sigame.xyz…`}
											</a>
										</li>

										<li>
											<a
												className='simpleLink'
												href="https://www.sibrowser.ru"
												target='_blank'
												rel='noopener noreferrer'>
												{`${localization.library} sibrowser.ru…`}
											</a>
										</li>
									</>
									: null}

									{!props.clearUrls && isWindowsOS()
										? <li>
											<a
												className='simpleLink'
												href="https://vladimirkhil.com/si/siquester"
												target='_blank'
												rel='noopener noreferrer'>
												{`${localization.createOwnPackage}…`}
											</a>
										</li>
										: null}
								</ul>
							}
							title={localization.select}
						>
							📂
						</FlyoutButton>

						<span className='packageName'>
							{getPackageName(props.gamePackageType, props.gamePackageName, props.gamePackageData)}
						</span>

						<PackageFileSelector
							ref={childRef}
							onGamePackageTypeChanged={props.onGamePackageTypeChanged}
							onGamePackageDataChanged={props.onGamePackageDataChanged} />
					</div>

					<p className='newGameHeader'>{localization.role}</p>

					<select title='Game role' value={props.gameRole} onChange={onGameRoleChanged}>
						<option value="0">{localization.viewer}</option>
						<option value="1">{localization.player}</option>
						<option value="2">{localization.showman}</option>
					</select>

					{props.gameRole === Role.Showman || props.isSingleGame ? null : (
						<>
							<p>{localization.showman}</p>

							<select
								title='Showman type'
								className="showmanTypeSelector"
								value={props.isShowmanHuman ? 1 : 0}
								onChange={onShowmanTypeChanged}
							>
								<option value="1">{localization.human}</option>
								<option value="0">{localization.bot}</option>
							</select>
							{props.isShowmanHuman ? '👤' : '🖥️'}
						</>
					)}

					<p className='newGameHeader'>{localization.players}</p>

					<div className="playersBlock">
						<span className="playersCountTitle">{`${localization.total} `}</span>
						<span className="playersCountValue">{props.playersCount}</span>

						<input
							aria-label='Players count'
							type="range"
							className="playersCount"
							min={2}
							max={12}
							value={props.playersCount}
							onChange={onPlayersCountChanged}
						/>
					</div>

					{props.isSingleGame ? null : (
						<>
							<div className="playersBlock">
								<span className="playersCountTitle">{`${localization.humanPlayers} `}</span>
								<span className="playersCountValue">{props.humanPlayersCount}</span>

								<input
									aria-label='Human players count'
									type="range"
									className="playersCount"
									min={0}
									max={humanPlayersMaxCount}
									disabled={humanPlayersMaxCount === 0}
									value={props.humanPlayersCount}
									onChange={onHumanPlayersCountChanged}
								/>
							</div>

							<div className="playersBlock">
								<span className="playersCountTitle">{`${localization.computerPlayers} `}</span>
								<span className="playersCountValue">{botsCount}</span>
							</div>

							<div className="playersBlock">
								{props.gameRole === Role.Player ? '🧑' : null}
								{Array.from(Array(props.humanPlayersCount).keys()).map(() => '👤')}
								{Array.from(Array(botsCount).keys()).map(() => '🖥️')}
							</div>
						</>
					)}
				</div>

				<div className="gameCreationError">{props.error}</div>

				<div className="buttonsArea">
					<button
						type="button"
						className="showSettings standard"
						disabled={!props.isConnected || props.inProgress}
						onClick={() => props.onShowSettings()}
					>
						{`${localization.settings}…`}
					</button>

					<button
						type="button"
						className="startGame standard"
						disabled={!props.isConnected || props.inProgress}
						onClick={() => props.onCreate(props.isSingleGame)}
					>
						{localization.startGame}
					</button>
				</div>

				{props.inProgress ? <ProgressBar isIndeterminate /> : null}

				{props.uploadPackageProgress ? (
					<div className="uploadPackagePanel">
						<div className="uploadPackageMessage">
							<span>{localization.sendingPackage}</span>
							<ProgressBar isIndeterminate={false} value={props.uploadPackagePercentage} />
						</div>
					</div>
				) : null}
			</Dialog>

			{isSIStorageOpen && (
				<SIStorageDialog onClose={() => setIsSIStorageOpen(false)} onSelect={onSelectSIPackage} />
			)}
		</>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(NewGameDialog);
