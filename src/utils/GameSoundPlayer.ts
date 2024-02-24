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

import GameSound from '../model/enums/GameSound';

class GameSoundPlayer {
	private sounds: Map<GameSound, string>;

	constructor() {
		this.sounds = new Map<GameSound, string>([
			[GameSound.ANSWER_WRONG, answerWrongSfx],
			[GameSound.APPLAUSE_BIG, applauseBigSfx],
			[GameSound.APPLAUSE_FINAL, applauseFinalSfx],
			[GameSound.APPLAUSE_SMALL, applauseSmallSfx],
			[GameSound.FINAL_DELETE, finalDeleteSfx],
			[GameSound.FINAL_THINK, finalThinkSfx],
			[GameSound.MAIN_MENU, mainMenuSfx],
			[GameSound.QUESTION_NOANSWERS, questionNoAnswersSfx],
			[GameSound.QUESTION_NORISK, questionNoRiskSfx],
			[GameSound.QUESTION_SECRET, questionSecretSfx],
			[GameSound.QUESTION_STAKE, questionStakeSfx],
			[GameSound.ROUND_BEGIN, roundBeginSfx],
			[GameSound.ROUND_THEMES, roundThemesSfx],
			[GameSound.ROUND_TIMEOUT, roundTimeoutSfx],
		]);
	}

	getSound(sound: GameSound) {
		return this.sounds.get(sound);
	}
}

const gameSoundPlayer = new GameSoundPlayer();
export { gameSoundPlayer };