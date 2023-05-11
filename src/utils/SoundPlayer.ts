// @ts-ignore
import testSfx from '../../assets/sounds/main_menu.mp3';

export default class SoundPlayer {
	play(sound: string) {
		const audio = new Audio(testSfx);
		audio.play();
	}
}