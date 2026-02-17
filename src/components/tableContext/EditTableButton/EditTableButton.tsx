import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import localization from '../../../model/resources/localization';
import { toggleEditTable } from '../../../state/room2Slice';

import './EditTableButton.scss';

const EditTableButton: React.FC = () => {
	const isConnected = useAppSelector(state => state.common.isSIHostConnected);
	const isEditTableEnabled = useAppSelector(state => state.room2.isEditTableEnabled);
	const appDispatch = useAppDispatch();

	return (
		<button
			type="button"
			className={`edit-table-button standard ${isEditTableEnabled ? 'active' : ''}`}
			disabled={!isConnected}
			onClick={() => appDispatch(toggleEditTable())}
		>
			{localization.editTable.toLocaleUpperCase()}
		</button>
	);
};

export default EditTableButton;