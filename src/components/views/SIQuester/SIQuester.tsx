import React, { useRef } from 'react';
import { useAppDispatch } from '../../../state/hooks';
import { navigate } from '../../../utils/Navigator';
import Path from '../../../model/enums/Path';
import localization from '../../../model/resources/localization';
import { openFile, createNewPackage } from '../../../state/siquesterSlice';

import './SIQuester.scss';

const SIQuester: React.FC = () => {
	const appDispatch = useAppDispatch();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];

		if (file && file.name.endsWith('.siq')) {
			appDispatch(openFile(file));
		}
	};

	const handleButtonClick = () => {
		fileInputRef.current?.click();
	};

	const handleNewPackageClick = () => {
		appDispatch(createNewPackage());
	};

	return (
		<div className='siquester'>
			<input
				hidden
				type="file"
				accept=".siq"
				onChange={handleFileChange}
				ref={fileInputRef}
			/>

			<div className='siquester__content'>
				<div className='siquester__logo' />
				<div className='siquester__title'>SIQuester</div>

				<div className='siquester__actions'>
					<button type='button' className='standard' onClick={handleNewPackageClick}>
						{localization.createPackage.toLocaleUpperCase()}
					</button>

					<button type='button' className='standard' onClick={handleButtonClick}>
						{localization.openFile.toLocaleUpperCase()}
					</button>

					<button
						type='button'
						className='standard'
						onClick={() => appDispatch(navigate({ navigation: { path: Path.Menu }, saveState: true }))}>
						{localization.exit.toLocaleUpperCase()}
					</button>
				</div>
			</div>
		</div>
	);
};

export default SIQuester;