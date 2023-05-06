import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import Dialog from '../common/Dialog';
import State from '../../state/State';
import localization from '../../model/resources/localization';
import SettingsState from '../../state/settings/SettingsState';
import settingsActionCreators from '../../state/settings/settingsActionCreators';
import TimeSettingsView from './TimeSettingsView';
import SettingsView from '../../model/enums/SettingsView';
import CommonSettingsView from './CommonSettingsView';
import RulesSettingsView from './RulesSettingsView';
import uiActionCreators from '../../state/ui/uiActionCreators';

import './SettingsDialog.css';

interface SettingsDialogProps {
	settings: SettingsState;
	onReset: () => void;
	onClose: () => void;
}

interface SettingsDialogState {
	view: SettingsView;
}

const mapStateToProps = (state: State) => ({
	settings: state.settings,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onReset: () => {
		dispatch(settingsActionCreators.resetSettings());
	},
	onClose: () => {
		dispatch(uiActionCreators.showSettings(false));
	},
});

export class SettingsDialog extends React.Component<SettingsDialogProps, SettingsDialogState> {
	private layout: React.RefObject<HTMLDivElement>;

	constructor(props: SettingsDialogProps) {
		super(props);

		this.state = { view: SettingsView.Common };
		this.layout = React.createRef<HTMLDivElement>();
	}

	componentDidMount(): void {
		window.addEventListener('mousedown', this.hide);
	}

	componentWillUnmount(): void {
		window.removeEventListener('mousedown', this.hide);
	}

	hide = (e: Event): void => {
		if (!this.layout.current || (e.target instanceof Node && this.layout.current.contains(e.target as Node))) {
			return;
		}

		this.props.onClose();
	};

	private tabChanged = (view: SettingsView) => {
		this.setState({ view });
	};

	private renderTab = () => {
		switch (this.state.view) {
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

	render(): JSX.Element {
		return (
			<Dialog id="settingsDialog" ref={this.layout} title={localization.settings} onClose={this.props.onClose}>
				<div className="settingsDialogBody">
					<div className="tabHost tabHeader">
						<h1
							className={this.state.view === SettingsView.Common ? 'activeTab' : ''}
							onClick={() => this.tabChanged(SettingsView.Common)}
						>
							{localization.common}
						</h1>
						<h1
							className={this.state.view === SettingsView.Rules ? 'activeTab' : ''}
							onClick={() => this.tabChanged(SettingsView.Rules)}
						>
							{localization.rules}
						</h1>
						<h1
							className={this.state.view === SettingsView.Time ? 'activeTab' : ''}
							onClick={() => this.tabChanged(SettingsView.Time)}
						>
							{localization.time}
						</h1>
					</div>

					<div className='settingsBody'>
						{this.renderTab()}

						<button className="reset standard" title={localization.resetToDefaultsHint} onClick={this.props.onReset}>
							{localization.resetToDefaults}
						</button>
					</div>
				</div>
			</Dialog>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingsDialog);
