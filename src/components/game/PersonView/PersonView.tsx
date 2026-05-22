import * as React from 'react';
import { connect } from 'react-redux';
import Account from '../../../model/Account';
import Constants from '../../../model/enums/Constants';
import localization from '../../../model/resources/localization';
import State from '../../../state/State';
import FlyoutButton, { FlyoutHorizontalOrientation } from '../../common/FlyoutButton/FlyoutButton';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { kick, setHost } from '../../../state/room2Slice';
import { changeTableType, deleteTable, freeTable, setTablePerson } from '../../../state/serverActions';
import getAvatarClass from '../../../utils/AccountHelpers';

import './PersonView.css';
import menuSvg from '../../../../assets/images/menu.svg';

interface PersonViewProps {
	account: Account | null;
	avatar: string | null;
	seat?: {
		isPlayerScope: boolean;
		tableIndex: number;
	};
}

function loadPersonReplacementList(
	selectedPerson: { name: string; isHuman: boolean },
	persons: Record<string, Account>,
	computerAccounts: string[] | null,
	isPlayerSelected: boolean
): string[] {
	if (selectedPerson.isHuman || !selectedPerson.name.trim()) {
		return Object
			.values(persons)
			.filter(person => person.isHuman && person.name !== selectedPerson.name)
			.map(person => person.name);
	}

	if (computerAccounts && isPlayerSelected) {
		return computerAccounts.filter(name => !persons[name]);
	}

	return [];
}

const mapStateToProps = (state: State) => ({
	avatar: state.user.avatar,
});

export function PersonView(props: PersonViewProps): JSX.Element {
	const appDispatch = useAppDispatch();
	const { computerAccounts, isConnected, name, persons, stage, windowWidth } = useAppSelector(state => ({
		computerAccounts: state.common.computerAccounts,
		isConnected: state.common.isSIHostConnected,
		name: state.room2.name,
		persons: state.room2.persons,
		stage: state.room2.stage,
		windowWidth: state.ui.windowWidth,
	}));
	let seatPerson = null;

	if (props.seat) {
		seatPerson = props.seat.isPlayerScope ? persons.players[props.seat.tableIndex] : persons.showman;
	}

	const personName = props.account?.name ?? seatPerson?.name ?? '';
	const replacementTarget = props.account ?? seatPerson;
	const isEmptySeat = !personName.trim();

	const isMe = personName === name;
	const isHost = personName === persons.hostName;
	const isWide = windowWidth >= Constants.WIDE_WINDOW_WIDTH;
	const isSeatEditingAllowed = !stage.isGameStarted || stage.isEditingTables;
	const canManageSeat = Boolean(props.seat && !isWide && name === persons.hostName && isConnected && isSeatEditingAllowed);

	const avatar = isMe ? props.avatar : props.account?.avatar ?? null;
	const canManagePerson = Boolean(props.account && persons.hostName === name && !isMe && props.account.isHuman);
	const canManage = canManagePerson || canManageSeat;
	const canFree = canManageSeat && Boolean(replacementTarget?.isHuman) && !isEmptySeat;
	const canDelete = canManageSeat && props.seat?.isPlayerScope && persons.players.length > Constants.MIN_PLAYER_COUNT;
	const canReplaceSeat = canManageSeat && Boolean(props.seat) && Boolean(replacementTarget);
	const replacementList = canReplaceSeat && props.seat && replacementTarget
		? loadPersonReplacementList(replacementTarget, persons.all, computerAccounts, props.seat.isPlayerScope)
		: [];
	const isBot = !isEmptySeat && Boolean(replacementTarget && !replacementTarget.isHuman);

	const onFreeTable = () => {
		if (!props.seat) {
			return;
		}

		appDispatch(freeTable({ isShowman: !props.seat.isPlayerScope, tableIndex: props.seat.tableIndex }));
	};

	const onDeleteTable = () => {
		if (!props.seat?.isPlayerScope) {
			return;
		}

		appDispatch(deleteTable(props.seat.tableIndex));
	};

	const onChangeTableType = () => {
		if (!props.seat) {
			return;
		}

		appDispatch(changeTableType({ isShowman: !props.seat.isPlayerScope, tableIndex: props.seat.tableIndex }));
	};

	const onSetTable = (selectedName: string) => {
		if (!props.seat) {
			return;
		}

		appDispatch(setTablePerson({ isShowman: !props.seat.isPlayerScope, tableIndex: props.seat.tableIndex, name: selectedName }));
	};

	return (
		<li className={`personItem ${isMe ? 'me' : ''}`}>
			<div
				className={`personItem_avatar ${getAvatarClass(props.account) ?? ''}`}
				style={{ backgroundImage: avatar ? `url("${avatar}")` : undefined }}
			/>

			<div className='personNameWrapper'>
				<span className='personName'>
					{isEmptySeat ? '' : personName}
				</span>
			</div>

			{isHost ? (<span className="personItem_host" role="img" aria-label="star" title={localization.host}>⭐</span>) : null}

			{canManage ? (
				<div className='personItem_menuHost'>
					<FlyoutButton
						className='personItem_menu'
						horizontalOrientation={FlyoutHorizontalOrientation.Left}
						flyout={
						<div className="personMenuFlyout">
							<ul className="personMenu">
								{canManagePerson ? <li onClick={() => appDispatch(setHost(personName))}>{localization.setHost}</li> : null}
								{canManagePerson ? <li onClick={() => appDispatch(kick(personName))}>{localization.kick}</li> : null}
								{canFree ? <li onClick={onFreeTable}>{localization.freeTable}</li> : null}
								{canDelete ? <li onClick={onDeleteTable}>{localization.deleteTable}</li> : null}
								{canManageSeat ? (
									<li onClick={onChangeTableType}>
										{isBot ? localization.changeToHuman : localization.changeToBot}
									</li>
								) : null}
							</ul>
							{replacementList.length > 0 ? (
								<div className="personMenuReplacementList">
									<div className="personMenuReplacementHeader">{localization.replaceWith}</div>
									<div className="personMenuReplacementItems">
										{replacementList.map(person => (
											<div
												key={person}
												className="personMenuReplacementItem"
												onClick={() => onSetTable(person)}
											>
												{person}
											</div>
										))}
									</div>
								</div>
							) : null}
						</div>
					}>
						<img src={menuSvg} alt={localization.menu} className="personItem_menuIcon" />
					</FlyoutButton>
				</div>)
				: null}
		</li>
	);
}

export default connect(mapStateToProps)(PersonView);
