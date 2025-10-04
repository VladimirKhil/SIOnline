import React from 'react';
import FlyoutButton, { FlyoutHorizontalOrientation, FlyoutVerticalOrientation } from '../../common/FlyoutButton/FlyoutButton';
import localization from '../../../model/resources/localization';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import Account from '../../../model/Account';
import Constants from '../../../model/enums/Constants';
import { changeTableType, deleteTable, freeTable, setTablePerson } from '../../../state/serverActions';
import PersonInfo from '../../../model/PersonInfo';

import './EditTableMenu.scss';
import menuSvg from '../../../../assets/images/menu.svg';

interface EditTableMenuProps {
	isPlayerScope: boolean;
	tableIndex: number;
	account: Account | null;
}

function loadPersonReplacementList(
	selectedPerson: PersonInfo | null,
	persons: Record<string, Account>,
	computerAccounts: string[] | null,
	isPlayerSelected: boolean
): string[] {
	if (!selectedPerson) {
		return [];
	}

	if (selectedPerson.isHuman) {
		return Object
			.values(persons)
			.filter(person => person.isHuman && person.name !== selectedPerson?.name)
			.map(person => person.name);
	}

	if (computerAccounts && isPlayerSelected) {
		return computerAccounts.filter(name => !persons[name]);
	}

	return [];
}

const EditTableMenu: React.FC<EditTableMenuProps> = (props) => {
	const common = useAppSelector(state => state.common);
	const ui = useAppSelector(state => state.ui);
	const room = useAppSelector(state => state.room2);
	const appDispatch = useAppDispatch();
	const isHost = room.name === room.persons.hostName;
	const isWide = ui.windowWidth >= Constants.WIDE_WINDOW_WIDTH;

	const canFree = props.account && props.account.isHuman;
	const canDelete = props.isPlayerScope && room.persons.players.length > Constants.MIN_PLAYER_COUNT;
	const isBot = props.account && !props.account.isHuman;

	// Get replacement list for the current table
	const { showman, players } = room.persons;
	const isPlayerSelected = props.isPlayerScope;
	const selectedPerson = props.isPlayerScope ? players[props.tableIndex] : showman;

	const replacementList: string[] = loadPersonReplacementList(
		selectedPerson,
		room.persons.all,
		common.computerAccounts,
		isPlayerSelected
	);

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

	const onSetTable = (name: string) => {
		appDispatch(setTablePerson({ isShowman: !props.isPlayerScope, tableIndex: props.tableIndex, name }));
	};

	return (
		<FlyoutButton
			className="editTableMenu"
			verticalOrientation={isWide ? FlyoutVerticalOrientation.Top : FlyoutVerticalOrientation.Bottom}
			horizontalOrientation={FlyoutHorizontalOrientation.Left}
			flyout={
				<div className="editTableMenuFlyout">
					<ul className="editTableMenuList">
						{canFree ? <li onClick={onFreeTable}>{localization.freeTable}</li> : null}
						{canDelete ? <li onClick={onDeleteTable}>{localization.deleteTable}</li> : null}
						<li onClick={onChangeTableType}>{isBot ? localization.changeToHuman : localization.changeToBot}</li>
					</ul>
					{replacementList.length > 0 && (
						<div className="replacementListContainer">
							<div className="replacementListHeader">{localization.replaceWith}</div>
							<div className="replacementList">
								{replacementList.map(person => (
									<div
										key={person}
										className="replacementItem"
										onClick={() => onSetTable(person)}
									>
										{person}
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			}>
			<img src={menuSvg} alt={localization.menu} className="editTableMenu_menuIcon" />
		</FlyoutButton>
	);
};

export default EditTableMenu;