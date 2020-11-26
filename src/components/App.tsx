import * as React from 'react';
import { connect } from 'react-redux';

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
import { Action, Dispatch } from 'redux';
import actionCreators from '../state/actionCreators';
import Games from './Games';

import './App.css';

interface AppProps {
	ads?: string;
	mainView: MainView;
	areSettingsVisible: boolean;

	closeNewGame: () => void;
}

const mapStateToProps = (state: State) => ({
	mainView: state.ui.mainView,
	areSettingsVisible: state.ui.areSettingsVisible
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	closeNewGame: () => {
		dispatch(actionCreators.navigateToWelcome());
	}
});

declare const onLoad: () => void;

export class App extends React.Component<AppProps> {
	constructor(props: AppProps) {
		super(props);
	}

	componentDidMount() {
		if (onLoad) {
			onLoad();
		}
	}

	getContent() {
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
				return <NewGameDialog isSingleGame={true} onClose={this.props.closeNewGame} />;

			case MainView.Games:
				return <Games />;

			case MainView.Lobby:
				return <OnlineView />;

			case MainView.Game:
				return <InGameView />;
		}

		return null;
	}

	render() {
		return (
			<div className="app">
				{this.getContent()}
				{this.props.areSettingsVisible ? <SettingsDialog /> : null}
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
