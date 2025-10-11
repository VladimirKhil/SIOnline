import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { setExternalMediaWarning } from '../../../state/tableSlice';
import localization from '../../../model/resources/localization';

import './ExternalMediaWarning.css';

const ExternalMediaWarning: React.FC = () => {
	const dispatch = useAppDispatch();
	const { externalMediaUris } = useAppSelector(state => state.table);

	if (externalMediaUris.length === 0) {
		return null;
	}

	const handleLoadExternal = () => {
		dispatch(setExternalMediaWarning([]));
	};

	return (
		<div className="external-media-warning">
			<div className="external-media-warning__content">
				<h3>{localization.externalMediaDetected}</h3>
				<p>
					{localization.externalMediaDescription}
				</p>
				<div className="external-media-warning__uris">
					{externalMediaUris.map((uri, index) => (
						<p key={index} className="external-media-warning__uri">{uri}</p>
					))}
				</div>
				<div className="external-media-warning__buttons">
					<button
						className="external-media-warning__button external-media-warning__button--primary"
						onClick={handleLoadExternal}
						type="button"
					>
						{localization.externalMediaLoad}
					</button>
				</div>
			</div>
		</div>
	);
};

export default ExternalMediaWarning;