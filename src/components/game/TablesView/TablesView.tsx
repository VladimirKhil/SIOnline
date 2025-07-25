/* eslint-disable react/no-array-index-key */
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, AnyAction } from 'redux';
import State from '../../../state/State';
import localization from '../../../model/resources/localization';
import roomActionCreators from '../../../state/room/roomActionCreators';
import PersonInfo from '../../../model/PersonInfo';
import TableView from '../TableView/TableView';
import Account from '../../../model/Account';
import FlyoutButton, { FlyoutHorizontalOrientation, FlyoutVerticalOrientation } from '../../common/FlyoutButton/FlyoutButton';
import { useAppSelector } from '../../../state/hooks';

import './TablesView.css';

interface TablesViewProps {
	isConnected: boolean;
	persons: Record<string, Account>;
	selectedIndex: number;
	computerAccounts: string[] | null;

	selectTable: (tableIndex: number) => void;
	setTable: (name: string) => void;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isSIHostConnected,
	persons: state.room2.persons.all,
	selectedIndex: state.room.selectedTableIndex,
	computerAccounts: state.common.computerAccounts
});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => ({
	selectTable: (tableIndex: number) => {
		dispatch(roomActionCreators.tableSelected(tableIndex));
	},
	setTable: (name: string) => {
		dispatch(roomActionCreators.setTable(name) as unknown as AnyAction);
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
	const room = useAppSelector(state => state.room2);
	const { showman, players } = room.persons;

	const isPlayerSelected = props.selectedIndex > 0 && props.selectedIndex <= players.length;

	const selectedPlayer = isPlayerSelected ? players[props.selectedIndex - 1] : null;
	const selectedPerson = props.selectedIndex === 0 ? showman : selectedPlayer;

	const replacementList: string[] = loadPersonReplacementList(selectedPerson, props, isPlayerSelected);

	const canSet = replacementList.length > 0;
	const isHost = room.name === room.persons.hostName;

	return (
		<>
			<div className="tablesList">
				<div className="tablesHeader">{localization.showman}</div>

				<ul>
					<TableView person={showman} isSelected={props.selectedIndex === 0} selectTable={() => props.selectTable(0)} />
				</ul>

				<div className="tablesHeader">
					<span>{localization.players}</span>
				</div>

				<ul>
					{players.map((player, index) => (
						<TableView
							key={index}
							person={player}
							isSelected={props.selectedIndex === index + 1}
							selectTable={() => props.selectTable(index + 1)}
						/>
					))}
				</ul>
			</div>

			<div className="buttonsPanel sidePanel">
				<FlyoutButton
					className='standard'
					disabled={!props.isConnected || !canSet || !isHost}
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
		</>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(TablesView);
