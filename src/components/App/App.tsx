﻿import * as React from 'react';
import { connect } from 'react-redux';
import State from '../../state/State';
import Login from '../views/Login/Login';
import About from '../views/About/About';
import MainMenu from '../views/MainMenu/MainMenu';
import Lobby from '../views/Lobby/Lobby';
import Room from '../views/Room/Room';
import SettingsDialog from '../settings/SettingsDialog';
import Games from '../views/Games/Games';
import ErrorView from '../views/Error/ErrorView';
import CookiesWarning from '../panels/CookiesWarning/CookiesWarning';
import AudioController from '../common/AudioController';
import NewGame from '../views/NewGame/NewGame';
import Path from '../../model/enums/Path';
import JoinRoom from '../views/JoinRoom/JoinRoom';
import Loading from '../views/Loading/Loading';
import ServerLicense from '../views/ServerLicense/ServerLicense';
import UserError from '../panels/UserError/UserError';

import './App.css';

interface AppProps {
	areSettingsVisible: boolean;
	commonError: string | null;
	userError: string | null;
	askForConsent: boolean;
	path: Path;
}

interface AppState {
	error: string | null;
}

const mapStateToProps = (state: State) => ({
	areSettingsVisible: state.ui.areSettingsVisible,
	commonError: state.common.error,
	userError: state.common.userError,
	askForConsent: state.common.askForConsent,
	path: state.ui.navigation.path,
});

export class App extends React.Component<AppProps, AppState> {
	constructor(props: AppProps) {
		super(props);

		this.state = { error: null };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error(`Component error: ${error} ${errorInfo}`);
	}

	public static getDerivedStateFromError(error: Error): AppState {
		return { error: `${error.message}: ${error.stack}` };
	}

	getContent(): JSX.Element | null {
		switch (this.props.path) {
			case Path.Loading:
				return <Loading />;

			case Path.AcceptLicense:
				return <ServerLicense />;

			case Path.Root:
				return <MainMenu />;

			case Path.Login:
				return <Login />;

			case Path.About:
				return <About />;

			case Path.Menu:
				return <MainMenu />;

			case Path.NewRoom:
				return <NewGame />;

			case Path.Rooms:
				return <Games />;

			case Path.Lobby:
				return <Lobby />;

			case Path.Room:
				return <Room />;

			case Path.JoinRoom:
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
				{this.props.userError ? <UserError error={this.props.userError} /> : null}
				<AudioController />
			</div>
		);
	}
}

export default connect(mapStateToProps)(App);
