import * as React from 'react';
import { connect } from 'react-redux';
import State from '../state/State';
import Login from './Login';
import About from './About';
import WelcomeView from './WelcomeView';
import OnlineView from './OnlineView';
import InGameView from './game/InGameView';
import SettingsDialog from './settings/SettingsDialog';
import Games from './Games';
import ErrorView from './ErrorView';
import CookiesWarning from './CookiesWarning';
import AudioController from './common/AudioController';
import NewGame from './NewGame';
import Path from '../model/enums/Path';
import JoinRoom from './JoinRoom';

import './App.css';

interface AppProps {
	ads?: string;
	areSettingsVisible: boolean;
	commonError: string | null;
	askForConsent: boolean;
	path: Path;
}

interface AppState {
	error: string | null;
}

const mapStateToProps = (state: State) => ({
	areSettingsVisible: state.ui.areSettingsVisible,
	commonError: state.common.error,
	askForConsent: state.common.askForConsent,
	path: state.ui.navigation.path,
});

declare const onLoad: () => void;

export class App extends React.Component<AppProps, AppState> {
	constructor(props: AppProps) {
		super(props);

		this.state = { error: null };
	}

	componentDidMount(): void {
		if (onLoad) {
			onLoad();
		}
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error(`Component error: ${error} ${errorInfo}`);
	}

	public static getDerivedStateFromError(error: Error): AppState {
		return { error: `${error.message}: ${error.stack}` };
	}

	getContent(): JSX.Element | null {
		switch (this.props.path) {
			case Path.Root:
				return <Login ads={this.props.ads} />;

			case Path.Login:
				return <Login ads={this.props.ads} />;

			case Path.About:
				return <About />;

			case Path.Menu:
				return <WelcomeView />;

			case Path.NewRoom:
				return <NewGame />;

			case Path.Rooms:
				return <Games />;

			case Path.Lobby:
				return <OnlineView />;

			case Path.Room:
				return <InGameView />;

			case Path.RoomJoin:
				return <JoinRoom />;

			default:
				return null;
		}
	}

	render(): JSX.Element {
		const error = this.props.commonError || this.state.error;

		return error ? <ErrorView error={error} /> : (
			<div className="app">
				{this.getContent()}
				{this.props.areSettingsVisible ? <SettingsDialog /> : null}
				{this.props.askForConsent ? <CookiesWarning /> : null}
				<AudioController />
			</div>
		);
	}
}

export default connect(mapStateToProps)(App);
