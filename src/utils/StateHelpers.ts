import State from '../state/State';

export default function isHost(state: State): boolean {
	return state.user.login === state.run.persons.hostName;
}
