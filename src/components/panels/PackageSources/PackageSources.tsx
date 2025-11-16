import * as React from 'react';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { setPackageType } from '../../../state/gameSlice';
import PackageType from '../../../model/enums/PackageType';
import localization from '../../../model/resources/localization';
import isWindowsOS from '../../../utils/isWindowsOS';
import Link from '../../common/Link/Link';

import './PackageSources.scss';

interface PackageSourcesProps {
	setIsSIStorageOpen: (isOpen: boolean, storageIndex: number) => void;
	onFilePackageSelected: () => void;
}

export default function PackageSources(props: PackageSourcesProps): JSX.Element {
	const appDispatch = useAppDispatch();
	const common = useAppSelector(state => state.common);
	const siPackages = useAppSelector(state => state.siPackages);

	const onRandomThemesSelected = () => {
		appDispatch(setPackageType(PackageType.Random));
	};

	return <ul className='packageSources'>
		<li onClick={onRandomThemesSelected}>{localization.randomThemes}</li>
		<li onClick={props.onFilePackageSelected}>{`${localization.file}…`}</li>

		{siPackages.storages.map((storage, index) => <li key={index} onClick={() => props.setIsSIStorageOpen(true, index)}>{`${storage.name}…`}</li>)}

		{!common.clearUrls && localization.userPackages.length > 0
		? <>
			<li>
				<Link
					className='simpleLink'
					href="https://vk.com/topic-135725718_53119401"
					target='_blank'
					rel='noopener noreferrer'>
					{`${localization.userPackages}…`}
				</Link>
			</li>
		</>
		: null}

		{!common.clearUrls && isWindowsOS()
			? <li>
				<Link
					className='simpleLink'
					href="https://vladimirkhil.com/si/siquester"
					target='_blank'
					rel='noopener noreferrer'>
					{`${localization.createOwnPackage}…`}
				</Link>
			</li>
			: null}
	</ul>;
}