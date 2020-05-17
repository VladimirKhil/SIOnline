import * as React from 'react';
import { connect } from 'react-redux';

import MainView from '../model/enums/MainView';

import State from '../state/State';

import Login from './Login';
import Loading from './Loading';
import HowToPlay from './HowToPlay';
import OnlineView from './OnlineView';
import InGameView from './game/InGameView';

interface AppProps {
	ads?: string;
	mainView: MainView;
}

const mapStateToProps = (state: State) => ({
	mainView: state.ui.mainView
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

	render() {
		switch (this.props.mainView) {
			case MainView.Loading:
				return <Loading />;

			case MainView.Login:
				return <Login ads={this.props.ads} />;

			case MainView.HowToPlay:
				return <HowToPlay />;

			case MainView.OnlineView:
				return <OnlineView />;

			case MainView.Game:
				return <InGameView />;
		}

		return null;
	}
}

export default connect(mapStateToProps)(App);
