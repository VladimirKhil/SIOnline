import * as React from 'react';
import localization from '../../../model/resources/localization';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';

import { setName,
	setPackageData,
	setPackageType,
	setPassword,
	setPlayersCount,
	setRole,
	setShowmanHuman,
	setVoiceChat } from '../../../state/gameSlice';

import Constants from '../../../model/enums/Constants';
import PackageType from '../../../model/enums/PackageType';
import FlyoutButton, { FlyoutTheme } from '../../common/FlyoutButton/FlyoutButton';
import PackageFileSelector from '../PackageFileSelector/PackageFileSelector';
import { AppDispatch } from '../../../state/store';
import State from '../../../state/State';
import PackageSources from '../PackageSources/PackageSources';
import Role from '../../../model/Role';
import { userErrorChanged } from '../../../state/commonSlice';
import { connect } from 'react-redux';
import onlineActionCreators from '../../../state/online/onlineActionCreators';
import { Dispatch } from 'react';
import { Action } from 'redux';
import { INavigationState } from '../../../state/uiSlice';
import AutoSizedText from '../../common/AutoSizedText/AutoSizedText';

import './RoomOptions.scss';

interface RoomOptionsProps {
	isSingleGame: boolean;
	isOralGame: boolean;
	navigation: INavigationState;
	isSIStorageOpen: boolean;

	onCreate: (isSingleGame: boolean, appDispatch: AppDispatch) => void;
	setIsSIStorageOpen: (isOpen: boolean, storageIndex: number) => void;
}

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onCreate: (isSingleGame: boolean, appDispatch: AppDispatch) => {
		dispatch(onlineActionCreators.createNewGame(isSingleGame, appDispatch) as unknown as Action);
	},
});

const mapStateToProps = (state: State) => ({
	isOralGame: state.settings.appSettings.oral,
	navigation: state.ui.navigation,
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

export function RoomOptions(props: RoomOptionsProps) {
	const game = useAppSelector((state) => state.game);
	const maxPackageSizeMb = useAppSelector(state => state.common.maxPackageSizeMb);
	const childRef = React.useRef<HTMLInputElement>(null);
	const appDispatch = useAppDispatch();

	const onFilePackageSelected = () => {
		if (childRef.current) {
			childRef.current.click();
		}
	};

	const onGameNameChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
		appDispatch(setName(e.target.value));
	};

	const onGamePasswordChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
		appDispatch(setPassword(e.target.value));
	};

	const onGameVoiceChatChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
		appDispatch(setVoiceChat(e.target.value));
	};

	const onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === Constants.KEY_ENTER_NEW) {
			props.onCreate(props.isSingleGame, appDispatch);
		}
	};

	const onGameRoleChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
		appDispatch(setRole(parseInt(e.target.value, 10)));
	};

	const onShowmanTypeChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
		appDispatch(setShowmanHuman(parseInt(e.target.value, 10) === 1));
	};

	const onPlayersCountChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
		appDispatch(setPlayersCount(parseInt(e.target.value, 10)));
	};

	const onGamePackageDataChanged = (name: string, packageData: File | null) => {
		if (packageData && packageData.size > maxPackageSizeMb * 1024 * 1024) {
			appDispatch(userErrorChanged(`${localization.packageIsTooBig} (${maxPackageSizeMb} MB)`));
			return;
		}

		appDispatch(setPackageData({ name, data: packageData }));
	};

	return <>
		{props.isSingleGame ? null : (
			<>
				<div className="block">
					<div className='blockName'>{localization.gameName}</div>

					<input
						type="text"
						className='blockValue'
						value={game.name}
						onChange={onGameNameChanged}
						onKeyPress={onKeyPress}
					/>
				</div>

				<div className="block">
					<div className='blockName'>{localization.password}</div>

					<input
						aria-label='Secret code'
						type="password"
						autoComplete='new-password'
						className='blockValue'
						value={game.password}
						onChange={onGamePasswordChanged}
						onKeyPress={onKeyPress}
					/>
				</div>

				{props.isOralGame ? (
					<div className="block">
						<div className='blockName'>{localization.voiceChat}</div>

						<input
							aria-label='Voice chat url'
							type="text"
							className='blockValue'
							value={game.voiceChat}
							onChange={onGameVoiceChatChanged}
						/>
				</div>
				) : null}
			</>
		)}

		<div className="block forPackage">
			<div className='blockName newGameHeader'>{localization.questionPackage}</div>

			<div className='blockValue packageSelector'>
				<FlyoutButton
					theme={FlyoutTheme.Dark}
					flyout={
						<PackageSources
							setIsSIStorageOpen={props.setIsSIStorageOpen}
							onFilePackageSelected={onFilePackageSelected}
						/>
					}
					title={localization.select}
				>
					📂
				</FlyoutButton>

				<div className='packageName'>
					{getPackageName(game.package.type, game.package.name, game.package.data)}
				</div>

				<PackageFileSelector
					ref={childRef}
					onGamePackageTypeChanged={(type) => appDispatch(setPackageType(type))}
					onGamePackageDataChanged={onGamePackageDataChanged} />

				{game.package.type === PackageType.File
					? <AutoSizedText className='packageFileWarning' maxFontSize={16}>{localization.packageFileWarning}</AutoSizedText>
					: null}
			</div>
		</div>

		<div className="block">
			<div className='blockName newGameHeader'>{localization.myRole}</div>

			<select className='blockValue' title='Game role' value={game.role} onChange={onGameRoleChanged}>
				<option value="0">{localization.viewer}</option>
				<option value="1">{localization.player}</option>
				<option value="2">{localization.showman}</option>
			</select>
		</div>

		{game.role === Role.Showman || props.isSingleGame ? null : (
			<div className="block">
				<div className='blockName'>{localization.showman}</div>

				<select
					title='Showman type'
					className="blockValue showmanTypeSelector"
					value={game.isShowmanHuman ? 1 : 0}
					onChange={onShowmanTypeChanged}
				>
					<option value="1">{localization.human}</option>
					<option value="0">{localization.bot}</option>
				</select>
			</div>
		)}

		<div className="block">
			<div className='blockName newGameHeader'>{localization.players}</div>

			<div className="blockValue playersBlock">
				<span className="playersCountValue">{game.playersCount}</span>

				<input
					aria-label='Players count'
					type="range"
					className="playersCount"
					min={2}
					max={12}
					value={game.playersCount}
					onChange={onPlayersCountChanged}
				/>
			</div>
		</div>
	</>;
}

export default connect(mapStateToProps, mapDispatchToProps)(RoomOptions);