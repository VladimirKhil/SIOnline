import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import Dialog from '../common/Dialog/Dialog';
import localization from '../../model/resources/localization';
import TimeSettingsView from './TimeSettingsView';
import SettingsView from '../../model/enums/SettingsView';
import CommonSettingsView from './CommonSettingsView';
import RulesSettingsView from './RulesSettingsView';
import uiActionCreators from '../../state/ui/uiActionCreators';
import { useAppDispatch } from '../../state/new/hooks';
import { resetSettings } from '../../state/new/settingsSlice';

import './SettingsDialog.css';

interface SettingsDialogProps {
	onClose: () => void;
}

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onClose: () => {
		dispatch(uiActionCreators.showSettings(false));
	},
});

const SettingsDialog: React.FC<SettingsDialogProps> = ({ onClose }) => {
	const [view, setView] = React.useState(SettingsView.Common);
	const layout = React.useRef<HTMLDivElement>(null);
	const appDispatch = useAppDispatch();

	const hide = (e: Event): void => {
		if (!layout.current || (e.target instanceof Node && layout.current.contains(e.target as Node))) {
			return;
		}

		onClose();
	};

	React.useEffect(() => {
		window.addEventListener('mousedown', hide);

		return () => {
			window.removeEventListener('mousedown', hide);
		};
	}, []);

	const renderTab = () => {
		switch (view) {
			case SettingsView.Common:
				return <CommonSettingsView />;

			case SettingsView.Rules:
				return <RulesSettingsView />;

			case SettingsView.Time:
				return <TimeSettingsView />;

			default:
				return null;
		}
	};

	const onReset = () => {
		appDispatch(resetSettings());
	};

	return (
		<Dialog id="settingsDialog" ref={layout} title={localization.settings} onClose={onClose}>
			<div className="settingsDialogBody">
				<div className="tabHost tabHeader">
					<h1 className={view === SettingsView.Common ? 'activeTab' : ''} onClick={() => setView(SettingsView.Common)}>
						{localization.common}
					</h1>
					<h1 className={view === SettingsView.Rules ? 'activeTab' : ''} onClick={() => setView(SettingsView.Rules)}>
						{localization.rules}
					</h1>
					<h1 className={view === SettingsView.Time ? 'activeTab' : ''} onClick={() => setView(SettingsView.Time)}>
						{localization.time}
					</h1>
				</div>

				<div className="settingsBody">
					{renderTab()}

					<button className="reset standard" title={localization.resetToDefaultsHint} onClick={onReset}>
						{localization.resetToDefaults}
					</button>
				</div>
			</div>
		</Dialog>
	);
};

export default connect(null, mapDispatchToProps)(SettingsDialog);
