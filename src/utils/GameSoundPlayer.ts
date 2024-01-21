// @ts-nocheck
import answerWrongSfx from '../../assets/sounds/answer_wrong.mp3';
import applauseBigSfx from '../../assets/sounds/applause_big.mp3';
import applauseFinalSfx from '../../assets/sounds/applause_final.mp3';
import applauseSmallSfx from '../../assets/sounds/applause_small.mp3';
import finalDeleteSfx from '../../assets/sounds/final_delete.mp3';
import finalThinkSfx from '../../assets/sounds/final_think.mp3';
import mainMenuSfx from '../../assets/sounds/main_menu.mp3';
import questionNoAnswersSfx from '../../assets/sounds/question_noanswers.mp3';
import questionNoRiskSfx from '../../assets/sounds/question_norisk.mp3';
import questionStakeSfx from '../../assets/sounds/question_stake.mp3';
import questionSecretSfx from '../../assets/sounds/question_secret.mp3';
import roundBeginSfx from '../../assets/sounds/round_begin.mp3';
import roundThemesSfx from '../../assets/sounds/round_themes.mp3';
import roundTimeoutSfx from '../../assets/sounds/round_timeout.mp3';

import IGameSoundPlayer from './IGameSoundPlayer';
import GameSound from '../model/enums/GameSound';

class GameSoundPlayer implements IGameSoundPlayer {
	private sounds: Map<GameSound, HTMLAudioElement>;

	private current: HTMLAudioElement | null;

	constructor() {
		this.sounds = new Map<GameSound, HTMLAudioElement>([
			[GameSound.ANSWER_WRONG, new Audio(answerWrongSfx)],
			[GameSound.APPLAUSE_BIG, new Audio(applauseBigSfx)],
			[GameSound.APPLAUSE_FINAL, new Audio(applauseFinalSfx)],
			[GameSound.APPLAUSE_SMALL, new Audio(applauseSmallSfx)],
			[GameSound.FINAL_DELETE, new Audio(finalDeleteSfx)],
			[GameSound.FINAL_THINK, new Audio(finalThinkSfx)],
			[GameSound.MAIN_MENU, new Audio(mainMenuSfx)],
			[GameSound.QUESTION_NOANSWERS, new Audio(questionNoAnswersSfx)],
			[GameSound.QUESTION_NORISK, new Audio(questionNoRiskSfx)],
			[GameSound.QUESTION_SECRET, new Audio(questionSecretSfx)],
			[GameSound.QUESTION_STAKE, new Audio(questionStakeSfx)],
			[GameSound.ROUND_BEGIN, new Audio(roundBeginSfx)],
			[GameSound.ROUND_THEMES, new Audio(roundThemesSfx)],
			[GameSound.ROUND_TIMEOUT, new Audio(roundTimeoutSfx)],
		]);
	}

	play(sound: GameSound, loop = false) {
		this.current = this.sounds.get(sound);
		this.current?.loop = loop;
		this.current.play().catch((e) => console.log(e));
	}

	pause() {
		if (!this.current) {
			return;
		}

		this.current.pause();
		this.current = null;
	}
}

const gameSoundPlayer = new GameSoundPlayer();
export { gameSoundPlayer };