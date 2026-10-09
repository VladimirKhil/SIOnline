import { Store } from 'redux';
import IHost from '../host/IHost';
import Constants from '../model/enums/Constants';
import GameStage from '../model/enums/GameStage';
import Path from '../model/enums/Path';
import PersonInfo from '../model/PersonInfo';
import RichPresence from '../model/RichPresence';
import localization from '../model/resources/localization';
import State from '../state/State';
import { getGameLink } from './inviteLink';

/** Other Discord users open room links in a browser, so the links lead to the web version. */
const WEB_APP_URI = 'https://sigame.vladimirkhil.com/';

function isRoomPath(path: Path): boolean {
	return path === Path.Room || path === Path.Demo;
}

function isPlaceOccupied(person: PersonInfo): boolean {
	return !!person.name && person.name !== Constants.ANY_NAME;
}

/** Only single games have no places for other people: they are protected with a random password. */
function hasPlacesForOthers(state: State): boolean {
	const { name, persons } = state.room2;

	// Places left by people are marked as computer ones, but they are free
	return [persons.showman, ...persons.players].some(person => person.name !== name && (person.isHuman || !isPlaceOccupied(person)));
}

function getPackageName(packageName: string | null): string | undefined {
	return packageName === Constants.RANDOM_PACKAGE ? localization.randomThemes : packageName || undefined;
}

function getRoomActivity(state: State): string {
	// Stage name is not reset on joining a room, so it is only relevant after the game start
	if (!state.room2.stage.isGameStarted) {
		return localization.presenceWaitingForStart;
	}

	const { name, roundIndex } = state.room.stage;

	switch (name) {
		case GameStage.Round: {
			const roundCount = state.room2.roundsNames.length;

			// Round names are written by package authors, so the round number is shown instead
			return roundIndex >= 0 && roundIndex < roundCount
				? `${localization.round} ${roundIndex + 1}/${roundCount}`
				: localization.round;
		}

		case GameStage.After:
			return localization.gameFinished;

		default:
			return localization.gameStarted;
	}
}

function getMenuActivity(path: Path): string {
	switch (path) {
		case Path.Lobby:
			return localization.presenceInLobby;

		case Path.NewRoom:
			return localization.presenceCreatingGame;

		case Path.JoinRoom:
		case Path.JoinByPin:
			return localization.joiningGame;

		case Path.SIQuester:
		case Path.SIQuesterPackage:
			return localization.presenceEditingPackage;

		default:
			return localization.presenceInMenu;
	}
}

/**
 * Builds Rich Presence describing what the user is currently doing.
 * Presence is visible on the user's Discord profile, so room names, person names and chat are never included.
 * The room link lets friends join the room; the room password is still required.
 */
export function buildRichPresence(state: State, startTimestamp: number): RichPresence {
	const { path } = state.ui.navigation;

	if (!isRoomPath(path)) {
		return { details: getMenuActivity(path), startTimestamp };
	}

	const presence: RichPresence = {
		details: getPackageName(state.room.metadata.packageName),
		state: getRoomActivity(state),
		startTimestamp,
	};

	const { players } = state.room2.persons;
	const occupiedPlaceCount = players.filter(isPlaceOccupied).length;

	// Discord requires a party to have at least one member
	if (occupiedPlaceCount > 0) {
		presence.partySize = occupiedPlaceCount;
		presence.partyMax = players.length;
	}

	const { gameId, hostUri } = state.ui.navigation;

	// Demo game is played locally
	if (path === Path.Room && gameId !== undefined && hostUri && hasPlacesForOthers(state)) {
		presence.joinUrl = `${WEB_APP_URI}?${getGameLink(gameId, hostUri, state.common.siHosts)}`;
		presence.joinLabel = localization.presenceJoin;
	}

	return presence;
}

/**
 * Publishes Rich Presence through the host whenever it changes.
 * The elapsed time counter restarts when the user enters or leaves a room.
 */
export function subscribeToRichPresence(store: Store<State>, host: IHost): void {
	if (!host.setRichPresence) {
		return;
	}

	let wasInRoom = false;
	let startTimestamp = Date.now();
	let lastPresenceKey = '';

	const publishPresence = () => {
		const state = store.getState();
		const isInRoom = isRoomPath(state.ui.navigation.path);

		if (isInRoom !== wasInRoom) {
			wasInRoom = isInRoom;
			startTimestamp = Date.now();
		}

		const presence = buildRichPresence(state, startTimestamp);
		const presenceKey = JSON.stringify(presence);

		// The store changes very often (timers, chat), but presence changes rarely
		if (presenceKey !== lastPresenceKey) {
			lastPresenceKey = presenceKey;
			host.setRichPresence?.(presence);
		}
	};

	publishPresence();
	store.subscribe(publishPresence);
}