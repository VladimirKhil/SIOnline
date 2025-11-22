import * as React from 'react';
import AutoSizedText from '../../common/AutoSizedText/AutoSizedText';
import Constants from '../../../model/enums/Constants';
import State from '../../../state/State';
import { connect } from 'react-redux';
import { useAppSelector } from '../../../state/hooks';

import './ShowmanReplic.css';

interface ShowmanReplicProps {
	windowWidth: number;
}

const mapStateToProps = (state: State) => ({
	windowWidth: state.ui.windowWidth,
});

export function ShowmanReplic(props: ShowmanReplicProps): JSX.Element {
	const { persons } = useAppSelector(state => ({
		persons: state.room2.persons,
	}));

	const { replic } = persons.showman;
	const isScreenWide = props.windowWidth >= Constants.WIDE_WINDOW_WIDTH;

	return (
		<AutoSizedText className={`showmanReplic replic ${replic || !isScreenWide ? '' : 'hidden'}`} maxFontSize={32}>
			{replic || ''}
		</AutoSizedText>
	);
}

export default connect(mapStateToProps)(ShowmanReplic);