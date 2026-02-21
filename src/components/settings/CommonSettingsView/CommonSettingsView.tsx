import * as React from 'react';
import localization from '../../../model/resources/localization';
import LanguageView from '../../panels/LanguageView/LanguageView';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';

import {
	setAppSound,
	setAttachContentToTable,
	setFloatingControls,
	setFullScreen,
	setMainMenuSound,
	setShowVideoAvatars,
	setSound,
	setSoundVolume,
	setUseProxy,
	setWriteGameLog,
	setLoadExternalMedia
} from '../../../state/settingsSlice';
import { setExternalMediaWarning } from '../../../state/tableSlice';

export function CommonSettingsView(): JSX.Element {
	const settings = useAppSelector(state => state.settings);
	const ui = useAppSelector(state => state.ui);
	const common = useAppSelector(state => state.common);
	const appDispatch = useAppDispatch();

	return (
		<div>
			<div className="settingItem">
				<input
					id="useProxy"
					type="checkbox"
					checked={settings.useProxy}
					onChange={() => appDispatch(setUseProxy(!settings.useProxy))}
				/>
				<label htmlFor="useProxy">{localization.useProxy}</label>
				<div className="hint">{localization.useProxyHint}</div>
			</div>

			<p className="header">{localization.language}</p>

			<LanguageView disabled={false} />

			{ui.isFullScreenSupported
				? <div className="settingItem">
					<input
						id="fullScreen"
						type="checkbox"
						checked={settings.fullScreen}
						onChange={() => appDispatch(setFullScreen(!settings.fullScreen))}
					/>

					<label htmlFor="fullScreen">{localization.fullScreen}</label>
				</div>
				: null}

			<div className="settingItem">
				<input
					id="sound"
					type="checkbox"
					checked={settings.sound}
					onChange={() => appDispatch(setSound(!settings.sound))}
				/>
				<label htmlFor="sound">{localization.sound}</label>
			</div>

			<div className="settingItem">
				<input
					id="appSound"
					type="checkbox"
					checked={settings.appSound}
					onChange={() => appDispatch(setAppSound(!settings.appSound))}
				/>
				<label htmlFor="appSound">{localization.soundApp}</label>
			</div>

			<div className="settingItem">
				<input
					id="mainMenuSound"
					type="checkbox"
					checked={settings.mainMenuSound}
					onChange={() => appDispatch(setMainMenuSound(!settings.mainMenuSound))}
				/>
				<label htmlFor="mainMenuSound">{localization.mainMenuSound}</label>
			</div>

			<p className="header">{localization.soundVolume}</p>

			<div className="settingItem">
				<input
					id="soundVolume"
					aria-label={localization.soundVolume}
					type="range"
					min={0}
					max={1}
					step={0.1}
					value={settings.soundVolume}
					onChange={(e) => appDispatch(setSoundVolume(Number(e.target.value)))}
				/>
			</div>

			<div className="settingItem">
				<input
					id="floatingControls"
					type="checkbox"
					checked={settings.floatingControls}
					onChange={() => appDispatch(setFloatingControls(!settings.floatingControls))}
				/>

				<label htmlFor="floatingControls">{localization.floatingControls}</label>
			</div>

			<div className="settingItem">
				<input
					id="attachContentToTable"
					type="checkbox"
					checked={settings.attachContentToTable}
					onChange={() => appDispatch(setAttachContentToTable(!settings.attachContentToTable))}
				/>

				<label htmlFor="attachContentToTable">{localization.attachContentToTable}</label>
			</div>

			<div className="settingItem">
				<input
					id="showVideoAvatars"
					type="checkbox"
					checked={settings.showVideoAvatars}
					onChange={() => appDispatch(setShowVideoAvatars(!settings.showVideoAvatars))}
				/>

				<label htmlFor="showVideoAvatars">{localization.showVideoAvatars}</label>
			</div>

			{common.logSupported
				? <div className="settingItem">
					<input
						id="writeGameLog"
						type="checkbox"
						checked={settings.writeGameLog}
						onChange={() => appDispatch(setWriteGameLog(!settings.writeGameLog))}
					/>

					<label htmlFor="writeGameLog">{localization.writeGameLog}</label>
				</div>
				: null}

			<div className="settingItem">
				<input
					id="loadExternalMedia"
					type="checkbox"
					checked={settings.loadExternalMedia}
					onChange={() => {
						const newValue = !settings.loadExternalMedia;
						appDispatch(setLoadExternalMedia(newValue));
						if (newValue) {
							appDispatch(setExternalMediaWarning([]));
						}
					}}
				/>

				<label htmlFor="loadExternalMedia">{localization.loadExternalMedia}</label>
				<div className="hint warning">{localization.loadExternalMediaHint}</div>
			</div>
		</div>
	);
}

export default CommonSettingsView;

