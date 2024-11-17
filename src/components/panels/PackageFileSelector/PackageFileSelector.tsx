import * as React from 'react';
import PackageType from '../../../model/enums/PackageType';

interface PackageFileSelectorProps {
	onGamePackageTypeChanged: (type: PackageType) => void;
	onGamePackageDataChanged: (name: string, data: File | null) => void;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const PackageFileSelector = React.forwardRef((props: PackageFileSelectorProps, ref: React.ForwardedRef<HTMLInputElement>) => {
	const onGamePackageDataChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			props.onGamePackageDataChanged(e.target.value, e.target.files[0]);
			props.onGamePackageTypeChanged(PackageType.File);
		}
	};

	return <input
		aria-label='Game package file'
		ref={ref}
		type="file"
		accept=".siq"
		onChange={onGamePackageDataChanged} />;
});

export default PackageFileSelector;
