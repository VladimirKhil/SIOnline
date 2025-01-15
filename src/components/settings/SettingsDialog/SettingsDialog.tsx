import * as React from 'react';
import Dialog from '../../common/Dialog/Dialog';
import localization from '../../../model/resources/localization';
import CommonSettingsView from '../CommonSettingsView/CommonSettingsView';
import { useAppDispatch } from '../../../state/hooks';
import { resetSettings } from '../../../state/settingsSlice';
import { showSettings } from '../../../state/uiSlice';

import './SettingsDialog.css';

const SettingsDialog: React.FC = () => {
	const layout = React.useRef<HTMLDivElement>(null);
	const appDispatch = useAppDispatch();

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

	return (
		<Dialog id="settingsDialog" ref={layout} title={localization.settings} onClose={onClose}>
			<div className="settingsDialogBody">
				<div className="settingsBody">
					<CommonSettingsView />

					<button className="reset standard" title={localization.resetToDefaultsHint} onClick={onReset}>
						{localization.resetToDefaults}
					</button>
				</div>
			</div>
		</Dialog>
	);
};

export default SettingsDialog;
