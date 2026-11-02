import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import localization from '../../../model/resources/localization';
import Dialog from '../../common/Dialog/Dialog';
import SIStorageDialog from '../SIStorageDialog/SIStorageDialog';
import onlineActionCreators from '../../../state/online/onlineActionCreators';
import { AppDispatch } from '../../../state/store';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import TabControl from '../../common/TabControl/TabControl';
import RulesSettingsView from '../../settings/RulesSettingsView/RulesSettingsView';
import TimeSettingsView from '../../settings/TimeSettingsView/TimeSettingsView';
import RoomOptions from '../RoomOptions/RoomOptions';
import { setPackageHostManaged, setPackageLibrary } from '../../../state/gameSlice';
import { setStorageIndex } from '../../../state/siPackagesSlice';
import ProgressDialog from '../ProgressDialog/ProgressDialog';
import AuthorizationMode from '../../../client/contracts/AuthorizationMode';
import { userErrorChanged } from '../../../state/commonSlice';
import { validateLoginName } from '../../../utils/loginValidation';

import './NewGameDialog.css';

interface NewGameDialogProps {
	isSingleGame: boolean;

	onCreate: (isSingleGame: boolean, appDispatch: AppDispatch, userName: string, authorizationMode: AuthorizationMode) => void;
	onClose: () => void;
}

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onCreate: (isSingleGame: boolean, appDispatch: AppDispatch, userName: string, authorizationMode: AuthorizationMode) => {
		dispatch(onlineActionCreators.createNewGame(isSingleGame, appDispatch, userName, authorizationMode) as unknown as Action);
	},
});

export function NewGameDialog(props: NewGameDialogProps) {
	const [activeTab, setActiveTab] = React.useState(0);
	const [isSIStorageOpen, setIsSIStorageOpen] = React.useState(false);
	const appDispatch = useAppDispatch();
	const navigation = useAppSelector(state => state.ui.navigation);
	const gameName = useAppSelector(state => state.game.name);
	const gameCreationProgress = useAppSelector(state => state.online2.gameCreationProgress);
	const uploadPackageProgress = useAppSelector(state => state.online2.uploadPackageProgress);
	const uploadPackagePercentage = useAppSelector(state => state.online2.uploadPackagePercentage);
	const downloadPackageProgress = useAppSelector(state => state.online2.downloadPackageProgress);
	const { login, authName } = useAppSelector(state => state.user);
	const [userName, setUserName] = React.useState(login);
	const [useAuth, setUseAuth] = React.useState(!!authName);

	React.useEffect(() => {
		setUserName(login);
	}, [login]);

	React.useEffect(() => {
		if (!authName) {
			setUseAuth(false);
		}
	}, [authName]);

	React.useEffect(() => {
		if (navigation.packageUri) {
			appDispatch(setPackageLibrary({
				id: '',
				name: navigation.packageName ?? navigation.packageUri,
				uri: navigation.packageUri
			}));
		}
	});

	const openStorage = (isOpen: boolean, storageIndex: number) => {
		appDispatch(setStorageIndex(storageIndex));
		setIsSIStorageOpen(isOpen);
	};

	const onSelectSIPackage = async (id: string, name: string, uri: string, hostManaged: boolean) => {
		setIsSIStorageOpen(false);

		if (hostManaged) {
			appDispatch(setPackageHostManaged({ name, id, uri }));
		} else {
			appDispatch(setPackageLibrary({ name, id, uri }));
		}
	};

	const onNameBlur = () => {
		const validationError = validateLoginName(userName);

		if (validationError) {
			appDispatch(userErrorChanged(validationError));
			return;
		}

		const trimmedName = userName.trim();

		if (trimmedName !== userName) {
			setUserName(trimmedName);
		}
	};

	const selectedUserName = useAuth && authName ? authName : userName;
	const isSelectedNameInvalid = !useAuth && validateLoginName(userName) !== null;
	const authorizationMode = useAuth ? AuthorizationMode.Account : AuthorizationMode.None;

	const onCreate = () => {
		if (!useAuth) {
			const validationError = validateLoginName(selectedUserName);

			if (validationError) {
				appDispatch(userErrorChanged(validationError));
				return;
			}
		}

		props.onCreate(props.isSingleGame, appDispatch, selectedUserName.trim(), authorizationMode);
	};

	function getContent(): React.ReactNode {
		switch (activeTab) {
			case 0:
				return <RoomOptions
					isSingleGame={props.isSingleGame}
					isSIStorageOpen={isSIStorageOpen}
					setIsSIStorageOpen={openStorage}
					userName={userName}
					setUserName={setUserName}
					useAuth={useAuth}
					setUseAuth={setUseAuth}
					authName={authName}
					onNameBlur={onNameBlur}
					onCreate={onCreate}
				/>;

			case 1:
				return <RulesSettingsView />;

			case 2:
				return <TimeSettingsView />;

			default:
				return null;
		}
	}

	let progressMessage = localization.creatingGame;

	if (downloadPackageProgress) {
		progressMessage = localization.downloadingPackage;
	} else if (uploadPackageProgress) {
		progressMessage = localization.sendingPackage;
	}

	return (
		<>
			<Dialog className="newGameDialog" title={localization.newGame} onClose={props.onClose}>
				<TabControl
					tabs={[{ id: 0, label: localization.room }, { id: 1, label: localization.rules }, { id: 2, label: localization.time } ]}
					activeTab={activeTab}
					onTabClick={setActiveTab} />

				<div className="settings">
					{getContent()}
				</div>

				<div className="buttonsArea">
					<button
						type="button"
						className="startGame mainAction active"
						disabled={gameCreationProgress || (!props.isSingleGame && gameName.length === 0) || isSelectedNameInvalid}
						onClick={onCreate}
					>
						{localization.startGame.toLocaleUpperCase()}
					</button>
				</div>

				{gameCreationProgress
					? <ProgressDialog
						title={progressMessage}
						isIndeterminate={!uploadPackageProgress}
						value={uploadPackageProgress ? uploadPackagePercentage : undefined} />
					: null}
			</Dialog>

			{isSIStorageOpen && (
				<SIStorageDialog onClose={() => setIsSIStorageOpen(false)} onSelect={onSelectSIPackage} />
			)}
		</>
	);
}

export default connect(null, mapDispatchToProps)(NewGameDialog);
