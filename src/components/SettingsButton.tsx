import * as React from 'react';
import { connect } from 'react-redux';
import localization from '../model/resources/localization';
import uiActionCreators from '../state/ui/uiActionCreators';
import Path from '../model/enums/Path';

import './SettingsButton.css';

interface SettingsButtonProps {
	onShowSettings: () => void;
	navigate: (path: Path) => void;
}

const mapDispatchToProps = (dispatch: any) => ({
	onShowSettings: () => {
		dispatch(uiActionCreators.showSettings(true));
	},
	navigate: (path: Path) => {
		dispatch(uiActionCreators.navigate({ path: path }));
	},
});

export function SettingsButton(props: SettingsButtonProps): JSX.Element {
	return (
		<button
			type='button'
			className="settingsButton"
			title={localization.settings}
			onClick={props.onShowSettings}
		>
			<span>⚙</span>
		</button>
	);
}

export default connect(null, mapDispatchToProps)(SettingsButton);
