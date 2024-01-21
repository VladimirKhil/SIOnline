import GameSound from '../model/enums/GameSound';

export default interface IGameSoundPlayer {
	play(sound: GameSound, loop: boolean): void;
	pause(): void;
}