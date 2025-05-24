import * as React from 'react';
import { connect, MapStateToProps } from 'react-redux';
import localization from '../../../model/resources/localization';
import State from '../../../state/State';
import Constants from '../../../model/enums/Constants';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { RootState } from '../../../state/store';
import { setOption } from '../../../state/serverActions';

import './GameMetadataView.scss';

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
	const room = useAppSelector((state: RootState) => state.room2);
	const room2Settings = room.settings;
	const appDispatch = useAppDispatch();
	const isHost = room.name === room.persons.hostName;

	return (
		<div className='gameMetadataView'>
			<dl>
				<dt>{localization.gameName}</dt>
				<dd>{props.gameName}</dd>
				<dt>{localization.questionPackage}</dt>
				<dd>{props.packageName === Constants.RANDOM_PACKAGE ? localization.randomThemes : props.packageName}</dd>
				<dt>{localization.contactUri}</dt>
				<dd>{props.contactUri}</dd>
			</dl>

			<div className='room__options'>
				<div className='room__options__header'>{localization.rules}</div>

				<div className='room__options__list'>
					<div className='room__option'>
						<label htmlFor="oral-input">{localization.oralGame}</label>
						<input
							id="oral-input"
							type="checkbox"
							checked={room2Settings.oral}
							disabled={!isHost}
							onChange={(e) => appDispatch(setOption({ name: 'Oral', value: e.target.checked.toString() }))}
						/>
					</div>

					<div className='room__option'>
						<label htmlFor="managed-input">{localization.managed}</label>
						<input
							id="managed-input"
							type="checkbox"
							checked={room2Settings.managed}
							disabled={true}
						/>
					</div>

					<div className='room__option'>
						<label htmlFor="falseStarts-input">{localization.falseStarts}</label>
						<input
							id="falseStarts-input"
							type="checkbox"
							checked={room2Settings.falseStart}
							disabled={true}
						/>
					</div>

					<div className='room__option'>
						<label htmlFor="partialText-input">{localization.partialText}</label>
						<input
							id="partialText-input"
							type="checkbox"
							checked={room2Settings.partialText}
							disabled={true}
						/>
					</div>

					<div className='room__option'>
						<label htmlFor="partialImages-input">{localization.partialImages}</label>
						<input
							id="partialImages-input"
							type="checkbox"
							checked={room2Settings.partialImages}
							disabled={true}
						/>
					</div>

					<div className='room__option'>
						<label htmlFor="readingSpeed-input">{localization.questionReadingSpeed}</label>
						<input
							id="readingSpeed-input"
							type="text"
							value={room2Settings.readingSpeed}
							readOnly={true}
						/>
					</div>

					<div className='room__option'>
						<label htmlFor="useApellations-input">{localization.useApellations}</label>
						<input
							id="useApellations-input"
							type="checkbox"
							checked={room2Settings.useApellations}
							disabled={true}
						/>
					</div>
				</div>
			</div>

			<div className='room__options'>
				<div className='room__options__header'>{localization.time}</div>

				<div className='room__options__list'>
					<div className='room__option'>
						<label htmlFor="buttonBlockingTime-input">{localization.timeForBlockingButton}</label>
						<input
							id="buttonBlockingTime-input"
							type="text"
							value={room2Settings.timeSettings.timeForBlockingButton}
							readOnly={true}
						/>
					</div>

					<div className='room__option'>
						<label htmlFor="partialImageTime-input">{localization.partialImageTime}</label>
						<input
							id="partialImageTime-input"
							type="number"
							value={room2Settings.timeSettings.partialImageTime}
							disabled={true}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

export default connect(mapStateToProps)(GameMetadataView);
