import * as React from 'react';
import AutoSizedText from '../../common/AutoSizedText/AutoSizedText';
import Constants from '../../../model/enums/Constants';
import State from '../../../state/State';
import { connect } from 'react-redux';
import { useAppSelector } from '../../../state/hooks';

import './ShowmanReplic.scss';

interface ShowmanReplicProps {
	windowWidth: number;
}

const mapStateToProps = (state: State) => ({
	windowWidth: state.ui.windowWidth,
});

export function ShowmanReplic(props: ShowmanReplicProps): JSX.Element {
	const { persons, replicIndex } = useAppSelector(state => ({
		persons: state.room2.persons,
		replicIndex: state.room2.replicIndex,
	}));

	const isScreenWide = props.windowWidth >= Constants.WIDE_WINDOW_WIDTH;
	const hasActivePlayerReplic = !isScreenWide && replicIndex > -1 && replicIndex < persons.players.length;
	const replic = hasActivePlayerReplic ? persons.players[replicIndex].answer : persons.showman.replic;

	return (
		<div className={`showmanReplic replic ${replic || !isScreenWide ? '' : 'hidden'}`}>
			<AutoSizedText
				key={replic}
				className="showmanReplicText"
				maxFontSize={32}
			>
				{replic || ''}
			</AutoSizedText>
		</div>
	);
}

export default connect(mapStateToProps)(ShowmanReplic);