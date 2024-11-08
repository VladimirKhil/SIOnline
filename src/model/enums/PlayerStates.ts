enum PlayerStates {
	None,
	Press,
	Lost,
	Right,
	Wrong,
	HasAnswered,
	Pass,
}

export default PlayerStates;

export function parsePlayerStatesFromString(value: string): PlayerStates {
	switch (value) {
		case 'None': return PlayerStates.None;
		case 'Answering': return PlayerStates.Press;
		case 'Lost': return PlayerStates.Lost;
		case 'Right': return PlayerStates.Right;
		case 'Wrong': return PlayerStates.Wrong;
		case 'HasAnswered': return PlayerStates.HasAnswered;
		case 'Pass': return PlayerStates.Pass;
		default: return PlayerStates.None;
	}
}
