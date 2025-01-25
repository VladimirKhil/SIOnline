import React, { Dispatch } from 'react';
import { useAppSelector } from '../../../state/hooks';
import localization from '../../../model/resources/localization';
import { connect } from 'react-redux';
import State from '../../../state/State';
import roomActionCreators from '../../../state/room/roomActionCreators';
import { Action } from 'redux';

import './EditTableButton.scss';

interface EditTableButtonProps {
	isEditEnabled: boolean;
	onEditTable: () => void;
}

const mapStateToProps = (state: State) => ({
	isEditEnabled: state.room.stage.isEditEnabled,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onEditTable: () => {
		dispatch(roomActionCreators.editTable());
	},
});


const EditTableButton: React.FC<EditTableButtonProps> = (props: EditTableButtonProps) => {
	const common = useAppSelector(state => state.common);

	return (
		<button
			type="button"
			className={`edit-table-button standard ${props.isEditEnabled ? 'active' : ''}`}
			disabled={!common.isSIHostConnected}
			onClick={() => props.onEditTable()}
		>
			{localization.editTable.toLocaleUpperCase()}
		</button>
	);
};

export default connect(mapStateToProps, mapDispatchToProps)(EditTableButton);