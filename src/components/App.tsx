import * as React from 'react';
import { connect } from 'react-redux';
import { Action, Dispatch } from 'redux';
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
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Logout from './Logout';
import actionCreators from '../logic/actionCreators';
import onlineActionCreators from '../state/online/onlineActionCreators';
import NewGame from './NewGame';
import Path from '../model/enums/Path';
import JoinRoom from './JoinRoom';

import './App.css';

interface AppProps {
	ads?: string;
	areSettingsVisible: boolean;
	commonError: string | null;
	askForConsent: boolean;

	onJoin: () => void;
	onGames: () => void;
	onLobby: () => void;
	onLogout: () => void;
}

interface AppState {
	error: string | null;
}

const mapStateToProps = (state: State) => ({
	areSettingsVisible: state.ui.areSettingsVisible,
	commonError: state.common.error,
	askForConsent: state.common.askForConsent,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onJoin: () => {
		dispatch(onlineActionCreators.receiveGameStart());
		dispatch(onlineActionCreators.friendsPlay() as unknown as Action);
	},
	onGames: () => {
		dispatch(onlineActionCreators.friendsPlay() as unknown as Action);
	},
	onLobby: () => {
		dispatch(onlineActionCreators.navigateToLobby() as unknown as Action);
	},
	onLogout: () => {
		dispatch(actionCreators.onExit() as unknown as Action);
	},
});

declare const onLoad: () => void;

export class App extends React.Component<AppProps, AppState> {
	private router: any;

	constructor(props: AppProps) {
		super(props);

		this.state = { error: null };

		this.router = createBrowserRouter([
			{
				path: Path.Root,
				element: <Login ads={this.props.ads} />
			},
			{
				path: Path.Login,
				element: <Login ads={this.props.ads} />
			},
			{
				path: Path.About,
				element: <About />
			},
			{
				path: Path.Menu,
				element: <WelcomeView />
			},
			{
				path: Path.NewRoom,
				element: <NewGame />
			},
			{
				path: Path.Rooms,
				loader: () => {
					this.props.onGames();
					return true;
				},
				element: <Games />
			},
			{
				path: Path.Lobby,
				loader: () => {
					this.props.onLobby();
					return true;
				},
				element: <OnlineView />
			},
			{
				path: Path.RoomJoin,
				loader: () => {
					this.props.onJoin();
					return true;
				},
				element: <JoinRoom />
			},
			{
				path: Path.Room,
				element: <InGameView />
			},
			{
				path: Path.Logout,
				loader: () => {
					this.props.onLogout();
					return true;
				},
				element: <Logout />
			},
		]);
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

	render(): JSX.Element {
		const error = this.props.commonError || this.state.error;

		return error ? <ErrorView error={error} /> : (
			<div className="app">
				<RouterProvider router={this.router} />
				{this.props.areSettingsVisible ? <SettingsDialog /> : null}
				{this.props.askForConsent ? <CookiesWarning /> : null}
				<AudioController />
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
