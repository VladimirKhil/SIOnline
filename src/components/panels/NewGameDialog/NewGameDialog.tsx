import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import localization from '../../../model/resources/localization';
import Dialog from '../../common/Dialog/Dialog';
import ProgressBar from '../../common/ProgressBar/ProgressBar';
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

import './NewGameDialog.css';

interface NewGameDialogProps {
	isSingleGame: boolean;

	onCreate: (isSingleGame: boolean, appDispatch: AppDispatch) => void;
	onClose: () => void;
}

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onCreate: (isSingleGame: boolean, appDispatch: AppDispatch) => {
		dispatch(onlineActionCreators.createNewGame(isSingleGame, appDispatch) as unknown as Action);
	},
});

export function NewGameDialog(props: NewGameDialogProps) {
	const [activeTab, setActiveTab] = React.useState(0);
	const [isSIStorageOpen, setIsSIStorageOpen] = React.useState(false);
	const appDispatch = useAppDispatch();
	const ui = useAppSelector(state => state.ui);
	const game = useAppSelector(state => state.game);
	const online = useAppSelector(state => state.online2);

	React.useEffect(() => {
		if (ui.navigation.packageUri) {
			appDispatch(setPackageLibrary({
				id: '',
				name: ui.navigation.packageName ?? ui.navigation.packageUri,
				uri: ui.navigation.packageUri
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

	function getContent(): React.ReactNode {
		switch (activeTab) {
			case 0:
				return <RoomOptions
					isSingleGame={props.isSingleGame}
					isSIStorageOpen={isSIStorageOpen}
					setIsSIStorageOpen={openStorage}
				/>;

			case 1:
				return <RulesSettingsView />;

			case 2:
				return <TimeSettingsView />;

			default:
				return null;
		}
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
						disabled={online.gameCreationProgress || (!props.isSingleGame && game.name.length === 0)}
						onClick={() => props.onCreate(props.isSingleGame, appDispatch)}
					>
						{localization.startGame.toLocaleUpperCase()}
					</button>
				</div>

				{online.gameCreationProgress
					? <ProgressDialog
						title={online.uploadPackageProgress ? localization.sendingPackage : localization.creatingGame}
						isIndeterminate={!online.uploadPackageProgress}
						value={online.uploadPackageProgress ? online.uploadPackagePercentage : undefined} />
					: null}
			</Dialog>

			{isSIStorageOpen && (
				<SIStorageDialog onClose={() => setIsSIStorageOpen(false)} onSelect={onSelectSIPackage} />
			)}
		</>
	);
}

export default connect(null, mapDispatchToProps)(NewGameDialog);
