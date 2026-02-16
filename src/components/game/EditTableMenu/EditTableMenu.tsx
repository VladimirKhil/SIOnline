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
	const isConnected = useAppSelector(state => state.common.isSIHostConnected);
	const computerAccounts = useAppSelector(state => state.common.computerAccounts);
	const windowWidth = useAppSelector(state => state.ui.windowWidth);
	const { name, persons, stage } = useAppSelector(state => ({
		name: state.room2.name,
		persons: state.room2.persons,
		stage: state.room2.stage
	}));
	const appDispatch = useAppDispatch();
	const isHost = name === persons.hostName;
	const isWide = windowWidth >= Constants.WIDE_WINDOW_WIDTH;
	const canFree = props.account && props.account.isHuman;
	const canDelete = props.isPlayerScope && persons.players.length > Constants.MIN_PLAYER_COUNT;
	const isBot = props.account && !props.account.isHuman;

	// Get replacement list for the current table
	const { showman, players } = persons;
	const isPlayerSelected = props.isPlayerScope;
	const selectedPerson = props.isPlayerScope ? players[props.tableIndex] : showman;

	const replacementList: string[] = loadPersonReplacementList(
		selectedPerson,
		persons.all,
		computerAccounts,
		isPlayerSelected
	);

	if (!isConnected || !isHost || (stage.isGameStarted && !stage.isEditingTables)) {
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
						{canFree ? <li onClick={onFreeTable}>
							<span className="menuIconWrap">
								<svg className="menuIcon" viewBox="0 0 24 24" fill="none"
									stroke="currentColor" strokeWidth="2"
									strokeLinecap="round" strokeLinejoin="round">
									<path d="M15 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
									<circle cx="8.5" cy="7" r="4" />
									<line x1="19" y1="5" x2="19" y2="13" />
									<polyline points="16 8 19 5 22 8" />
								</svg>
							</span>
							{localization.freeTable}
						</li> : null}
						{canDelete ? <li onClick={onDeleteTable}>
							<span className="menuIconWrap">
								<svg className="menuIcon" viewBox="0 0 24 24" fill="none"
									stroke="currentColor" strokeWidth="2"
									strokeLinecap="round" strokeLinejoin="round">
									<polyline points="3 6 5 6 21 6" />
									<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
									<path d="M10 11v6" />
									<path d="M14 11v6" />
									<path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
								</svg>
							</span>
							{localization.deleteTable}
						</li> : null}
						<li onClick={onChangeTableType}>
							<span className="menuIconWrap">
								{isBot ? (
									<svg className="menuIcon" viewBox="0 0 24 24" fill="none"
										stroke="currentColor" strokeWidth="2"
										strokeLinecap="round" strokeLinejoin="round">
										<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
										<circle cx="12" cy="7" r="4" />
									</svg>
								) : (
									<svg className="menuIcon" viewBox="0 0 24 24" fill="none"
										stroke="currentColor" strokeWidth="2"
										strokeLinecap="round" strokeLinejoin="round">
										<rect x="4" y="4" width="16" height="16" rx="2" />
										<circle cx="9" cy="10" r="1.5" fill="currentColor" />
										<circle cx="15" cy="10" r="1.5" fill="currentColor" />
										<path d="M8 15h8" />
										<line x1="12" y1="1" x2="12" y2="4" />
									</svg>
								)}
							</span>
							{isBot ? localization.changeToHuman : localization.changeToBot}
						</li>
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