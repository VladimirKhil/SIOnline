import * as React from 'react';
import { connect } from 'react-redux';
import { Action, Dispatch } from 'redux';
import MainView from '../model/enums/MainView';
import State from '../state/State';
import Login from './Login';
import Loading from './Loading';
import About from './About';
import WelcomeView from './WelcomeView';
import OnlineView from './OnlineView';
import InGameView from './game/InGameView';
import SettingsDialog from './settings/SettingsDialog';
import NewGameDialog from './NewGameDialog';
import Games from './Games';
import ErrorView from './ErrorView';
import CookiesWarning from './CookiesWarning';
import uiActionCreators from '../state/ui/uiActionCreators';
import AudioController from './common/AudioController';

import './App.css';

interface AppProps {
	ads?: string;
	mainView: MainView;
	areSettingsVisible: boolean;
	commonError: string | null;
	askForConsent: boolean;

	closeNewGame: () => void;
}

interface AppState {
	error: string | null;
}

const mapStateToProps = (state: State) => ({
	mainView: state.ui.mainView,
	areSettingsVisible: state.ui.areSettingsVisible,
	commonError: state.common.error,
	askForConsent: state.common.askForConsent,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	closeNewGame: () => {
		dispatch(uiActionCreators.navigateToWelcome());
	}
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
		switch (this.props.mainView) {
			case MainView.Loading:
				return <Loading />;

			case MainView.Login:
				return <Login ads={this.props.ads} />;

			case MainView.About:
				return <About />;

			case MainView.Welcome:
				return <WelcomeView />;

			case MainView.NewGame:
				return <NewGameDialog isSingleGame onClose={this.props.closeNewGame} />;

			case MainView.Games:
				return <Games />;

			case MainView.Lobby:
				return <OnlineView />;

			case MainView.Game:
				return <InGameView />;

			case MainView.Error:
				return <ErrorView error={this.props.commonError} />;

			default:
				return null;
		}
	}

	render(): JSX.Element {
		return this.state.error ? <ErrorView error={this.state.error} /> : (
			<div className="app">
				{this.getContent()}
				{this.props.areSettingsVisible ? <SettingsDialog /> : null}
				{this.props.askForConsent ? <CookiesWarning /> : null}
				<AudioController />
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
