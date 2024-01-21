import * as React from 'react';
import AutoSizedText from '../common/AutoSizedText';
import Constants from '../../model/enums/Constants';
import State from '../../state/State';
import { connect } from 'react-redux';

import './ShowmanReplic.css';

interface ShowmanReplicProps {
	replic: string | null;
	windowWidth: number;
}

const mapStateToProps = (state: State) => ({
	replic: state.room.persons.showman.replic,
	windowWidth: state.ui.windowWidth,
});

export function ShowmanReplic(props: ShowmanReplicProps): JSX.Element {
	const isScreenWide = props.windowWidth >= Constants.WIDE_WINDOW_WIDTH;

	return (
		<AutoSizedText className={`showmanReplic ${props.replic || !isScreenWide ? '' : 'hidden'}`} maxFontSize={48}>
			{props.replic || ''}
		</AutoSizedText>
	);
}

export default connect(mapStateToProps)(ShowmanReplic);