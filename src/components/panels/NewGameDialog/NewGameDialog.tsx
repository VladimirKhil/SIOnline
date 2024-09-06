import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import localization from '../../../model/resources/localization';
import Dialog from '../../common/Dialog/Dialog';
import ProgressBar from '../../common/ProgressBar';
import State from '../../../state/State';
import PackageType from '../../../model/enums/PackageType';
import SIStorageDialog from '../../SIStorageDialog';
import onlineActionCreators from '../../../state/online/onlineActionCreators';
import { INavigationState } from '../../../state/ui/UIState';
import { AppDispatch } from '../../../state/new/store';
import { useAppDispatch } from '../../../state/new/hooks';
import TabControl from '../../common/TabControl/TabControl';
import RulesSettingsView from '../../settings/RulesSettingsView/RulesSettingsView';
import TimeSettingsView from '../../settings/TimeSettingsView/TimeSettingsView';
import RoomOptions from '../RoomOptions/RoomOptions';

import { setPackageLibrary, setPackageType } from '../../../state/new/gameSlice';

import './NewGameDialog.css';

interface NewGameDialogProps {
	isConnected: boolean;
	isSingleGame: boolean;
	isOralGame: boolean;
	inProgress: boolean;
	uploadPackageProgress: boolean;
	uploadPackagePercentage: number;
	navigation: INavigationState;
	clearUrls?: boolean;

	onCreate: (isSingleGame: boolean, appDispatch: AppDispatch) => void;
	onClose: () => void;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isConnected,
	isOralGame: state.settings.appSettings.oral,
	inProgress: state.online.gameCreationProgress,
	uploadPackageProgress:  state.online.uploadPackageProgress,
	uploadPackagePercentage: state.online.uploadPackagePercentage,
	navigation: state.ui.navigation,
	clearUrls: state.common.clearUrls,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onCreate: (isSingleGame: boolean, appDispatch: AppDispatch) => {
		dispatch(onlineActionCreators.createNewGame(isSingleGame, appDispatch) as unknown as Action);
	},
});

export function NewGameDialog(props: NewGameDialogProps) {
	const [activeTab, setActiveTab] = React.useState(0);
	const [isSIStorageOpen, setIsSIStorageOpen] = React.useState(false);
	const appDispatch = useAppDispatch();

	React.useEffect(() => {
		if (props.navigation.packageUri) {
			appDispatch(setPackageType(PackageType.SIStorage));

			appDispatch(setPackageLibrary({
				id: '',
				name: props.navigation.packageName ?? props.navigation.packageUri,
				uri: props.navigation.packageUri
			}));
		}
	});

	const onSelectSIPackage = async (id: string, name: string, uri: string) => {
		setIsSIStorageOpen(false);

		appDispatch(setPackageType(PackageType.SIStorage));
		appDispatch(setPackageLibrary({ name, id, uri }));
	};

	function getContent(): React.ReactNode {
		switch (activeTab) {
			case 0:
				return <RoomOptions
					isSingleGame={props.isSingleGame}
					isSIStorageOpen={isSIStorageOpen}
					setIsSIStorageOpen={setIsSIStorageOpen}
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
						disabled={!props.isConnected || props.inProgress}
						onClick={() => props.onCreate(props.isSingleGame, appDispatch)}
					>
						{localization.startGame.toLocaleUpperCase()}
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
