import * as React from 'react';
import { connect } from 'react-redux';
import State from '../../state/State';
import Login from '../views/Login/Login';
import About from '../views/About/About';
import MainMenu from '../views/MainMenu/MainMenu';
import Lobby from '../views/Lobby/Lobby';
import Room from '../views/Room/Room';
import SettingsDialog from '../settings/SettingsDialog/SettingsDialog';
import ErrorView from '../views/Error/ErrorView';
import CookiesWarning from '../panels/CookiesWarning/CookiesWarning';
import AudioController from '../common/AudioController/AudioController';
import NewGame from '../views/NewGame/NewGame';
import Path from '../../model/enums/Path';
import JoinRoom from '../views/JoinRoom/JoinRoom';
import Loading from '../views/Loading/Loading';
import ServerLicense from '../views/ServerLicense/ServerLicense';
import UserError from '../panels/UserError/UserError';
import { MessageLevel } from '../../state/commonSlice';
import ProfileView from '../panels/AvatarViewDialog/ProfileView';
import JoinByPin from '../views/JoinByPin/JoinByPin';
import SIQuester from '../views/SIQuester/SIQuester';
import PackageView from '../siquester/PackageView/PackageView';

import './App.css';

interface AppProps {
	areSettingsVisible: boolean;
	profileVisible: boolean;
	commonError: string | null;
	userError: string | null;
	messageLevel: MessageLevel;
	askForConsent: boolean;
	path: Path;
}

const mapStateToProps = (state: State) => ({
	areSettingsVisible: state.ui.areSettingsVisible,
	profileVisible: state.ui.isProfileVisible,
	commonError: state.common.error,
	userError: state.common.userError,
	messageLevel: state.common.messageLevel,
	askForConsent: state.common.askForConsent,
	path: state.ui.navigation.path,
});

export class App extends React.Component<AppProps> {
	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error(`Component error: ${error} ${errorInfo}`);
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

			case Path.Lobby:
				return <Lobby />;

			case Path.Room:
				return <Room />;

			case Path.JoinRoom:
				return <JoinRoom canJoinAsViewer={true} />;

			case Path.JoinByPin:
				return <JoinByPin />;

			case Path.SIQuester:
				return <SIQuester />;

			case Path.SIQuesterPackage:
				return <PackageView />;

			default:
				return null;
		}
	}

	render(): JSX.Element {
		const error = this.props.commonError;

		return error ? <ErrorView error={error} /> : (
			<div className="app">
				{this.getContent()}
				{this.props.areSettingsVisible ? <SettingsDialog /> : null}
				{this.props.profileVisible ? <ProfileView /> : null}
				{this.props.askForConsent ? <CookiesWarning /> : null}
				{this.props.userError ? <UserError error={this.props.userError} messageLevel={this.props.messageLevel} /> : null}
				<AudioController />
			</div>
		);
	}
}

export default connect(mapStateToProps)(App);
