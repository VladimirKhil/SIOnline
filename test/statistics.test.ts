// Test file to verify PlayerStatistics functionality
import PlayerStatistics from '../src/model/PlayerStatistics';
import { showStatistics } from '../src/state/tableSlice';

// Example test data
const sampleStatistics: PlayerStatistics[] = [
	{
		name: 'Player 1',
		rightAnswerCount: 8,
		wrongAnswerCount: 2,
		rightTotal: 4500,
		wrongTotal: 1000
	},
	{
		name: 'Player 2',
		rightAnswerCount: 5,
		wrongAnswerCount: 5,
		rightTotal: 2500,
		wrongTotal: 2500
	},
	{
		name: 'Player 3',
		rightAnswerCount: 3,
		wrongAnswerCount: 7,
		rightTotal: 1500,
		wrongTotal: 3500
	}
];

// Example of how the action would be dispatched
// dispatch(showStatistics(sampleStatistics));

export { sampleStatistics };
