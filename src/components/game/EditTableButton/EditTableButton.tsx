import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import localization from '../../../model/resources/localization';
import { toggleEditTable } from '../../../state/room2Slice';

import './EditTableButton.scss';

const EditTableButton: React.FC = () => {
	const common = useAppSelector(state => state.common);
	const room = useAppSelector(state => state.room2);
	const appDispatch = useAppDispatch();

	return (
		<button
			type="button"
			className={`edit-table-button standard ${room.isEditTableEnabled ? 'active' : ''}`}
			disabled={!common.isSIHostConnected}
			onClick={() => appDispatch(toggleEditTable())}
		>
			{localization.editTable.toLocaleUpperCase()}
		</button>
	);
};

export default EditTableButton;