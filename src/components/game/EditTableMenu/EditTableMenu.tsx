import React from 'react';
import FlyoutButton, { FlyoutHorizontalOrientation } from '../../common/FlyoutButton/FlyoutButton';
import localization from '../../../model/resources/localization';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import Account from '../../../model/Account';
import Constants from '../../../model/enums/Constants';
import { deleteTable, freeTable } from '../../../state/serverActions';

import './EditTableMenu.scss';
import menuSvg from '../../../../assets/images/menu.svg';

interface EditTableMenuProps {
	isPlayerScope: boolean;
	tableIndex: number;
	account: Account | null;
}

const EditTableMenu: React.FC<EditTableMenuProps> = (props) => {
	const common = useAppSelector(state => state.common);
	const room = useAppSelector(state => state.room2);
	const appDispatch = useAppDispatch();
	const isHost = room.name === room.persons.hostName;

	const canFree = props.account && props.account.isHuman;
	const canDelete = props.isPlayerScope && room.persons.players.length > Constants.MIN_PLAYER_COUNT;

	if (!common.isSIHostConnected || !isHost || (!canFree && !canDelete) || (room.stage.isGameStarted && !room.stage.isEditingTables)) {
		return null;
	}

	const onFreeTable = () => {
		appDispatch(freeTable({ isShowman: !props.isPlayerScope, tableIndex: props.tableIndex }));
	};

	const onDeleteTable = () => {
		appDispatch(deleteTable(props.tableIndex));
	};

	return (
		<FlyoutButton
			className="editTableMenu"
			horizontalOrientation={FlyoutHorizontalOrientation.Left}
			flyout={
				<ul className="editTableMenuList">
					{canFree ? <li onClick={onFreeTable}>{localization.freeTable}</li> : null}
					{canDelete ? <li onClick={onDeleteTable}>{localization.deleteTable}</li> : null}
				</ul>
			}>
			<img src={menuSvg} alt={localization.menu} className="editTableMenu_menuIcon" />
		</FlyoutButton>
	);
};

export default EditTableMenu;