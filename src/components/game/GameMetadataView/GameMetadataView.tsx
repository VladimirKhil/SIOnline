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

	// Local state for editing numeric values
	const [readingSpeedValue, setReadingSpeedValue] = React.useState(room2Settings.readingSpeed.toString());
	const [blockingButtonTimeValue, setBlockingButtonTimeValue] = React.useState(room2Settings.timeSettings.timeForBlockingButton.toString());
	const [partialImageTimeValue, setPartialImageTimeValue] = React.useState(room2Settings.timeSettings.partialImageTime.toString());

	// Update local state when Redux state changes
	React.useEffect(() => {
		setReadingSpeedValue(room2Settings.readingSpeed.toString());
		setBlockingButtonTimeValue(room2Settings.timeSettings.timeForBlockingButton.toString());
		setPartialImageTimeValue(room2Settings.timeSettings.partialImageTime.toString());
	}, [room2Settings.readingSpeed, room2Settings.timeSettings.timeForBlockingButton, room2Settings.timeSettings.partialImageTime]);

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
							disabled={!isHost}
							onChange={(e) => appDispatch(setOption({ name: 'Managed', value: e.target.checked.toString() }))}
						/>
					</div>

					<div className='room__option'>
						<label htmlFor="falseStarts-input">{localization.falseStarts}</label>
						<input
							id="falseStarts-input"
							type="checkbox"
							checked={room2Settings.falseStart}
							disabled={!isHost}
							onChange={(e) => appDispatch(setOption({ name: 'FalseStart', value: e.target.checked.toString() }))}
						/>
					</div>

					<div className='room__option'>
						<label htmlFor="partialText-input">{localization.partialText}</label>
						<input
							id="partialText-input"
							type="checkbox"
							checked={room2Settings.partialText}
							disabled={!isHost || room2Settings.falseStart}
							onChange={(e) => appDispatch(setOption({ name: 'PartialText', value: e.target.checked.toString() }))}
						/>
					</div>

					<div className='room__option'>
						<label htmlFor="partialImages-input">{localization.partialImages}</label>
						<input
							id="partialImages-input"
							type="checkbox"
							checked={room2Settings.partialImages}
							disabled={!isHost || room2Settings.falseStart}
							onChange={(e) => appDispatch(setOption({ name: 'PartialImages', value: e.target.checked.toString() }))}
						/>
					</div>

					<div className='room__option'>
						<label htmlFor="readingSpeed-input">{localization.questionReadingSpeed}</label>
						<input
							id="readingSpeed-input"
							type="number"
							min="1"
							max="100"
							value={readingSpeedValue}
							disabled={!isHost}
							onChange={(e) => setReadingSpeedValue(e.target.value)}
							onBlur={(e) => {
								const value = parseInt(e.target.value, 10);
								if (value > 0 && value <= 100) {
									appDispatch(setOption({ name: 'ReadingSpeed', value: value.toString() }));
								} else {
									// Reset to valid value if input is invalid
									setReadingSpeedValue(room2Settings.readingSpeed.toString());
								}
							}}
						/>
					</div>

					<div className='room__option'>
						<label htmlFor="useApellations-input">{localization.useApellations}</label>
						<input
							id="useApellations-input"
							type="checkbox"
							checked={room2Settings.useApellations}
							disabled={!isHost}
							onChange={(e) => appDispatch(setOption({ name: 'UseApellations', value: e.target.checked.toString() }))}
						/>
					</div>

					<div className='room__option'>
						<label htmlFor="displayLabels-input">{localization.displayAnswerOptionsLabels}</label>
						<input
							id="displayLabels-input"
							type="checkbox"
							checked={room2Settings.displayAnswerOptionsLabels}
							disabled={!isHost}
							onChange={(e) => appDispatch(setOption({ name: 'DisplayAnswerOptionsLabels', value: e.target.checked.toString() }))}
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
							type="number"
							min="1"
							max="10"
							value={blockingButtonTimeValue}
							disabled={true}
							style={{ borderWidth: 0 }}
							onChange={(e) => setBlockingButtonTimeValue(e.target.value)}
							onBlur={(e) => {
								const value = parseInt(e.target.value, 10);
								if (value > 0 && value <= 10) {
									appDispatch(setOption({ name: 'TimeForBlockingButton', value: value.toString() }));
								} else {
									// Reset to valid value if input is invalid
									setBlockingButtonTimeValue(room2Settings.timeSettings.timeForBlockingButton.toString());
								}
							}}
						/>
					</div>

					<div className='room__option'>
						<label htmlFor="partialImageTime-input">{localization.partialImageTime}</label>
						<input
							id="partialImageTime-input"
							type="number"
							min="1"
							max="20"
							value={partialImageTimeValue}
							disabled={!isHost || room2Settings.falseStart}
							onChange={(e) => setPartialImageTimeValue(e.target.value)}
							onBlur={(e) => {
								const value = parseInt(e.target.value, 10);
								if (value > 0 && value <= 20) {
									appDispatch(setOption({ name: 'PartialImageTime', value: value.toString() }));
								} else {
									// Reset to valid value if input is invalid
									setPartialImageTimeValue(room2Settings.timeSettings.partialImageTime.toString());
								}
							}}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

export default connect(mapStateToProps)(GameMetadataView);
