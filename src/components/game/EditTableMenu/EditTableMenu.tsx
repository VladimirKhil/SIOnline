import React from 'react';
import FlyoutButton, { FlyoutHorizontalOrientation } from '../../common/FlyoutButton/FlyoutButton';
import localization from '../../../model/resources/localization';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import Account from '../../../model/Account';
import Constants from '../../../model/enums/Constants';
import { changeTableType, deleteTable, freeTable } from '../../../state/serverActions';

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
	const isBot = props.account && !props.account.isHuman;

	if (!common.isSIHostConnected || !isHost || (room.stage.isGameStarted && !room.stage.isEditingTables)) {
		return null;
	}

	const onFreeTable = () => {
		appDispatch(freeTable({ isShowman: !props.isPlayerScope, tableIndex: props.tableIndex }));
	};

	const onDeleteTable = () => {
		appDispatch(deleteTable(props.tableIndex));
	};

	const onChangeTableType = () => {
		appDispatch(changeTableType({ isShowman: !props.isPlayerScope, tableIndex: props.tableIndex }));
	};

	return (
		<FlyoutButton
			className="editTableMenu"
			horizontalOrientation={FlyoutHorizontalOrientation.Left}
			flyout={
				<ul className="editTableMenuList">
					{canFree ? <li onClick={onFreeTable}>{localization.freeTable}</li> : null}
					{canDelete ? <li onClick={onDeleteTable}>{localization.deleteTable}</li> : null}
					<li onClick={onChangeTableType}>{isBot ? localization.changeToHuman : localization.changeToBot}</li>
				</ul>
			}>
			<img src={menuSvg} alt={localization.menu} className="editTableMenu_menuIcon" />
		</FlyoutButton>
	);
};

export default EditTableMenu;