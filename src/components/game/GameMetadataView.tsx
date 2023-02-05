import * as React from 'react';
import { connect, MapStateToProps } from 'react-redux';
import localization from '../../model/resources/localization';
import State from '../../state/State';

import './GameMetadataView.css';

interface GameMetadataViewProps {
	gameName: string | null;
	packageName: string | null;
	contactUri: string | null;
}

const mapStateToProps: MapStateToProps<GameMetadataViewProps, unknown, State> = (state: State) => ({
	gameName: state.room.metadata.gameName,
	packageName: state.room.metadata.packageName,
	contactUri: state.room.metadata.contactUri,
});

export function GameMetadataView(props: GameMetadataViewProps): JSX.Element {
	return (
		<div className='gameMetadataView'>
			<dl>
				<dt>{localization.gameName}</dt>
				<dd>{props.gameName}</dd>
				<dt>{localization.questionPackage}</dt>
				<dd>{props.packageName}</dd>
				<dt>{localization.contactUri}</dt>
				<dd>{props.contactUri}</dd>
			</dl>
		</div>
	);
}

export default connect(mapStateToProps)(GameMetadataView);
