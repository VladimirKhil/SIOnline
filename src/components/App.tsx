import * as React from 'react';
import { connect } from 'react-redux';

import MainView from '../model/enums/MainView';

import State from '../state/State';

import Login from './Login';
import Loading from './Loading';
import About from './About';
import OnlineView from './OnlineView';
import InGameView from './game/InGameView';
import SettingsDialog from './settings/SettingsDialog';

import './App.css';

interface AppProps {
	ads?: string;
	mainView: MainView;
	areSettingsVisible: boolean;
}

const mapStateToProps = (state: State) => ({
	mainView: state.ui.mainView,
	areSettingsVisible: state.ui.areSettingsVisible
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

			case MainView.OnlineView:
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

export default connect(mapStateToProps)(App);
