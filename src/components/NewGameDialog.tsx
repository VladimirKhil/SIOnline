import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import gameActionCreators from '../state/game/gameActionCreators';
import localization from '../model/resources/localization';
import Dialog from './common/Dialog';
import ProgressBar from './common/ProgressBar';
import State from '../state/State';
import Role from '../client/contracts/Role';
import Constants from '../model/enums/Constants';
import PackageType from '../model/enums/PackageType';
import SIStorageDialog from './SIStorageDialog';
import FlyoutButton, { FlyoutTheme } from './common/FlyoutButton';
import uiActionCreators from '../state/ui/uiActionCreators';
import onlineActionCreators from '../state/online/onlineActionCreators';
import isWindowsOS from '../utils/isWindowsOS';

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

interface NewGameDialogState {
	isSIStorageOpen: boolean;
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
	uploadPackagePercentage: state.online.uploadPackagePercentage
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
	}
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

export class NewGameDialog extends React.Component<NewGameDialogProps, NewGameDialogState> {
	private fileRef: React.RefObject<HTMLInputElement>;

	constructor(props: NewGameDialogProps) {
		super(props);

		this.fileRef = React.createRef<HTMLInputElement>();

		this.state = {
			isSIStorageOpen: false
		};
	}

	private onGameNameChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.props.onGameNameChanged(e.target.value);
	};

	private onGamePasswordChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.props.onGamePasswordChanged(e.target.value);
	};

	private onGameVoiceChatChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.props.onGameVoiceChatChanged(e.target.value);
	};

	private onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === Constants.KEY_ENTER_NEW) {
			this.props.onCreate(this.props.isSingleGame);
		}
	};

	private onRandomThemesSelected = () => {
		this.props.onGamePackageTypeChanged(PackageType.Random);
	};

	private onFilePackageSelected = () => {
		if (this.fileRef.current) {
			this.fileRef.current.click();
		}
	};

	private onSIStorageSelected = () => {
		this.setState({
			isSIStorageOpen: true
		});
	};

	private onGamePackageDataChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			this.props.onGamePackageDataChanged(e.target.value, e.target.files[0]);
			this.props.onGamePackageTypeChanged(PackageType.File);
		}
	};

	private onGameRoleChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
		this.props.onGameRoleChanged(parseInt(e.target.value, 10));
	};

	private onShowmanTypeChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
		this.props.showmanTypeChanged(parseInt(e.target.value, 10) === 1);
	};

	private onPlayersCountChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.props.onPlayersCountChanged(parseInt(e.target.value, 10));
	};

	private onHumanPlayersCountChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.props.onHumanPlayersCountChanged(parseInt(e.target.value, 10));
	};

	private onSIPackageDialogClose = () => {
		this.setState({
			isSIStorageOpen: false
		});
	};

	private onSelectSIPackage = async (id: string, name: string, uri: string) => {
		this.setState({
			isSIStorageOpen: false
		});

		this.props.onGamePackageTypeChanged(PackageType.SIStorage);
		this.props.onGamePackageLibraryChanged(id, name, uri);
	};

	render(): JSX.Element {
		const humanPlayersMaxCount = this.props.playersCount - (this.props.gameRole === Role.Player ? 1 : 0);
		const botsCount = Math.max(0, humanPlayersMaxCount - this.props.humanPlayersCount);

		return (
			<>
				<Dialog id="newGameDialog" title={localization.newGame} onClose={this.props.onClose}>
					<div className="settings">
						{this.props.isSingleGame ? null : (
							<>
								<p>{localization.gameName}</p>

								<input
									type="text"
									value={this.props.gameName}
									onChange={this.onGameNameChanged}
									onKeyPress={this.onKeyPress}
								/>

								<p>{localization.password}</p>

								<input
									type="password"
									value={this.props.gamePassword}
									onChange={this.onGamePasswordChanged}
									onKeyPress={this.onKeyPress}
								/>

								{this.props.isOralGame ? (
									<>
										<p>{localization.voiceChat}</p>

										<input
											type="text"
											value={this.props.gameVoiceChat}
											onChange={this.onGameVoiceChatChanged}
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
										<li onClick={this.onRandomThemesSelected}>{localization.randomThemes}</li>
										<li onClick={this.onFilePackageSelected}>{`${localization.file}…`}</li>
										<li onClick={this.onSIStorageSelected}>{`${localization.libraryTitle}…`}</li>

										{localization.userPackages.length > 0
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

										{isWindowsOS()
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
								{getPackageName(this.props.gamePackageType, this.props.gamePackageName, this.props.gamePackageData)}
							</span>

							<input ref={this.fileRef} type="file" accept=".siq" onChange={this.onGamePackageDataChanged} />
						</div>

						{this.props.gamePackageType === PackageType.File
							? (<div className="licenseAgreement">{localization.licenseAgreement}</div>)
							: null}

						<p className='newGameHeader'>{localization.role}</p>

						<select value={this.props.gameRole} onChange={this.onGameRoleChanged}>
							<option value="0">{localization.viewer}</option>
							<option value="1">{localization.player}</option>
							<option value="2">{localization.showman}</option>
						</select>

						{this.props.gameRole === Role.Showman || this.props.isSingleGame ? null : (
							<>
								<p>{localization.showman}</p>
								<select
									className="showmanTypeSelector"
									value={this.props.isShowmanHuman ? 1 : 0}
									onChange={this.onShowmanTypeChanged}
								>
									<option value="1">{localization.human}</option>
									<option value="0">{localization.bot}</option>
								</select>
								{this.props.isShowmanHuman ? '👤' : '🖥️'}
							</>
						)}

						<p className='newGameHeader'>{localization.players}</p>

						<div className="playersBlock">
							<span className="playersCountTitle">{`${localization.total} `}</span>
							<span className="playersCountValue">{this.props.playersCount}</span>

							<input
								type="range"
								className="playersCount"
								min={2}
								max={12}
								value={this.props.playersCount}
								onChange={this.onPlayersCountChanged}
							/>
						</div>

						{this.props.isSingleGame ? null : (
							<>
								<div className="playersBlock">
									<span className="playersCountTitle">{`${localization.humanPlayers} `}</span>
									<span className="playersCountValue">{this.props.humanPlayersCount}</span>

									<input
										type="range"
										className="playersCount"
										min={0}
										max={humanPlayersMaxCount}
										disabled={humanPlayersMaxCount === 0}
										value={this.props.humanPlayersCount}
										onChange={this.onHumanPlayersCountChanged}
									/>
								</div>

								<div className="playersBlock">
									<span className="playersCountTitle">{`${localization.computerPlayers} `}</span>
									<span className="playersCountValue">{botsCount}</span>
								</div>

								<div className="playersBlock">
									{this.props.gameRole === Role.Player ? '🧑' : null}
									{Array.from(Array(this.props.humanPlayersCount).keys()).map(() => '👤')}
									{Array.from(Array(botsCount).keys()).map(() => '🖥️')}
								</div>
							</>
						)}
					</div>

					<div className="gameCreationError">{this.props.error}</div>

					<div className="buttonsArea">
						<button
							type="button"
							className="showSettings standard"
							disabled={!this.props.isConnected || this.props.inProgress}
							onClick={() => this.props.onShowSettings()}
						>
							{`${localization.settings}…`}
						</button>

						<button
							type="button"
							className="startGame standard"
							disabled={!this.props.isConnected || this.props.inProgress}
							onClick={() => this.props.onCreate(this.props.isSingleGame)}
						>
							{localization.startGame}
						</button>
					</div>

					{this.props.inProgress ? <ProgressBar isIndeterminate /> : null}

					{this.props.uploadPackageProgress ? (
						<div className="uploadPackagePanel">
							<div className="uploadPackageMessage">
								<span>{localization.sendingPackage}</span>
								<ProgressBar isIndeterminate={false} value={this.props.uploadPackagePercentage} />
							</div>
						</div>
					) : null}
				</Dialog>

				{this.state.isSIStorageOpen && (
					<SIStorageDialog onClose={this.onSIPackageDialogClose} onSelect={this.onSelectSIPackage} />
				)}
			</>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(NewGameDialog);
