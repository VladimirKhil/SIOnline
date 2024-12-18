import * as React from 'react';
import AutoSizedText from '../../common/AutoSizedText/AutoSizedText';
import Constants from '../../../model/enums/Constants';
import State from '../../../state/State';
import { connect } from 'react-redux';
import { useAppSelector } from '../../../state/new/hooks';

import './ShowmanReplic.css';

interface ShowmanReplicProps {
	windowWidth: number;
}

const mapStateToProps = (state: State) => ({
	windowWidth: state.ui.windowWidth,
});

export function ShowmanReplic(props: ShowmanReplicProps): JSX.Element {
	const roomState = useAppSelector(state => state.room2);
	const { replic } = roomState.persons.showman;
	const isScreenWide = props.windowWidth >= Constants.WIDE_WINDOW_WIDTH;

	return (
		<AutoSizedText className={`showmanReplic replic ${replic || !isScreenWide ? '' : 'hidden'}`} maxFontSize={32}>
			{replic || ''}
		</AutoSizedText>
	);
}

export default connect(mapStateToProps)(ShowmanReplic);