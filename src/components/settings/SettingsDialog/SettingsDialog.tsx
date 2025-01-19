import * as React from 'react';
import Dialog from '../../common/Dialog/Dialog';
import localization from '../../../model/resources/localization';
import CommonSettingsView from '../CommonSettingsView/CommonSettingsView';
import ThemeSettingsView from '../ThemeSettingsView/ThemeSettingsView';
import { useAppDispatch } from '../../../state/hooks';
import { resetSettings } from '../../../state/settingsSlice';
import { showSettings } from '../../../state/uiSlice';
import TabControl from '../../common/TabControl/TabControl';
import KeysSettingsView from '../KeysSettingsView/KeysSettingsView';

import './SettingsDialog.css';

const enum SettingsView {
	Common,
	Keys,
	Theme,
}

const SettingsDialog: React.FC = () => {
	const layout = React.useRef<HTMLDivElement>(null);
	const appDispatch = useAppDispatch();

	const [view, setView] = React.useState(SettingsView.Common);

	const onClose = () => {
		appDispatch(showSettings(false));
	};

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

	const onReset = () => {
		appDispatch(resetSettings());
	};

	function getTabView(): React.ReactNode {
		switch (view) {
			case SettingsView.Common:
				return <CommonSettingsView />;

			case SettingsView.Keys:
				return <KeysSettingsView />;

			case SettingsView.Theme:
				return <ThemeSettingsView />;

			default:
				return null;
		}
	}

	return (
		<Dialog id="settingsDialog" ref={layout} title={localization.settings} onClose={onClose}>
			<div className="settingsDialogBody">
				<div className="settingsBody">
					<TabControl
						tabs={[
							{ id: SettingsView.Common, label: localization.common },
							{ id: SettingsView.Keys, label: localization.keys },
							//{ id: SettingsView.Theme, label: localization.theme },
						]}
						activeTab={view}
						onTabClick={setView} />

					{getTabView()}

					<button type='button' className="reset standard" title={localization.resetToDefaultsHint} onClick={onReset}>
						{localization.resetToDefaults}
					</button>
				</div>
			</div>
		</Dialog>
	);
};

export default SettingsDialog;
