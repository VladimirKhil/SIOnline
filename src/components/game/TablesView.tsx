/* eslint-disable react/no-array-index-key */
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, AnyAction } from 'redux';
import State from '../../state/State';
import localization from '../../model/resources/localization';
import runActionCreators from '../../state/run/runActionCreators';
import PersonInfo from '../../model/PersonInfo';
import PlayerInfo from '../../model/PlayerInfo';
import TableView from './TableView';
import Constants from '../../model/enums/Constants';
import Account from '../../model/Account';
import FlyoutButton, { FlyoutHorizontalOrientation, FlyoutVerticalOrientation } from '../common/FlyoutButton';

import './TablesView.css';

interface TablesViewProps {
	isConnected: boolean;
	showman: PersonInfo;
	players: PlayerInfo[];
	persons: Record<string, Account>;
	selectedIndex: number;
	isGameStarted: boolean;
	computerAccounts: string[] | null;

	selectTable: (tableIndex: number) => void;
	addTable: () => void;
	deleteTable: () => void;
	freeTable: () => void;
	changeType: () => void;
	setTable: (name: string) => void;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isConnected,
	showman: state.run.persons.showman,
	players: state.run.persons.players,
	persons: state.run.persons.all,
	selectedIndex: state.run.selectedTableIndex,
	isGameStarted: state.run.stage.isGameStarted,
	computerAccounts: state.common.computerAccounts
});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => ({
	selectTable: (tableIndex: number) => {
		dispatch(runActionCreators.tableSelected(tableIndex));
	},
	addTable: () => {
		dispatch(runActionCreators.addTable() as unknown as AnyAction);
	},
	deleteTable: () => {
		dispatch(runActionCreators.deleteTable() as unknown as AnyAction);
	},
	freeTable: () => {
		dispatch(runActionCreators.freeTable() as unknown as AnyAction);
	},
	changeType: () => {
		dispatch(runActionCreators.changeType() as unknown as AnyAction);
	},
	setTable: (name: string) => {
		dispatch(runActionCreators.setTable(name) as unknown as AnyAction);
	}
});

function loadPersonReplacementList(selectedPerson: PersonInfo | null, props: TablesViewProps, isPlayerSelected: boolean) : string[] {
	if (!selectedPerson) {
		return [];
	}

	if (selectedPerson.isHuman) {
		return Object
			.values(props.persons)
			.filter(person => person.isHuman && person.name !== selectedPerson?.name)
			.map(person => person.name);
	}
	
	if (props.computerAccounts && isPlayerSelected) {
		return props.computerAccounts.filter(name => !props.persons[name]);
	}

	return [];
}

export function TablesView(props: TablesViewProps): JSX.Element {
	// You cannot add unlimited number of tables
	const canAdd = props.players.length < Constants.MAX_PLAYER_COUNT;

	const isPlayerSelected = props.selectedIndex > 0 && props.selectedIndex <= props.players.length;

	const selectedPlayer = isPlayerSelected ? props.players[props.selectedIndex - 1] : null;
	const selectedPerson = props.selectedIndex === 0 ? props.showman : selectedPlayer;
	const selectedAccount = selectedPerson ? props.persons[selectedPerson.name] : null;

	// You can delete occupied tables only before game start
	const canDelete = props.players.length > Constants.MIN_PLAYER_COUNT &&
		isPlayerSelected &&
		(!props.isGameStarted || !selectedAccount);

	const canFree = !props.isGameStarted && selectedAccount && selectedAccount.isHuman;

	const canChangeType = !props.isGameStarted && selectedPerson;

	const replacementList: string[] = loadPersonReplacementList(selectedPerson, props, isPlayerSelected);

	const canSet = !props.isGameStarted && replacementList.length > 0;

	return (
		<>
			<div className="tablesList">
				<div className="tablesHeader">{localization.showman}</div>
				<ul>
					<TableView person={props.showman} isSelected={props.selectedIndex === 0} selectTable={() => props.selectTable(0)} />
				</ul>
				<div className="tablesHeader">
					<span>{localization.players}</span>
					<button
						type="button"
						className="addTableButton"
						onClick={() => props.addTable()}
						disabled={!props.isConnected || !canAdd}
						title={localization.addTable}
					>
						<span>+</span>
					</button>
				</div>
				<ul>
					{props.players.map((player, index) => (
						<TableView
							key={index}
							person={player}
							isSelected={props.selectedIndex === index + 1}
							selectTable={() => props.selectTable(index + 1)}
						/>
					))}
				</ul>
			</div>
			<div className="buttonsPanel">
				<button
					className='replacePersonButton standard'
					type="button"
					onClick={() => props.changeType()}
					disabled={!props.isConnected || !canChangeType}>
					{selectedPerson && selectedPerson.isHuman ? localization.changeToBot : localization.changeToHuman}
				</button>
				<FlyoutButton
					className='standard'
					disabled={!props.isConnected || !canSet}
					alignWidth
					flyout={(
						<ul className='replacers'>
							{replacementList.map(person => <li key={person} onClick={() => props.setTable(person)}>{person}</li>)}
						</ul>
					)}
					horizontalOrientation={FlyoutHorizontalOrientation.Left}
					verticalOrientation={FlyoutVerticalOrientation.Top}
				>
					{localization.replaceWith}
				</FlyoutButton>
			</div>
			<div className="buttonsPanel">
				<button type="button" className='standard' onClick={() => props.freeTable()} disabled={!props.isConnected || !canFree}>
					{localization.freeTable}
				</button>
				<button type="button" className='standard' onClick={() => props.deleteTable()} disabled={!props.isConnected || !canDelete}>
					{localization.deleteTable}
				</button>
			</div>
		</>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(TablesView);
