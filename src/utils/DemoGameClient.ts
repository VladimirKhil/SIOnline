import GameStage from '../client/contracts/GameStage';
import IGameClient from '../client/game/IGameClient';
import JoinMode from '../client/game/JoinMode';
import IClientBase from '../client/IClientBase';
import ClientController from '../logic/ClientController';
import PlayerStates from '../model/enums/PlayerStates';
import Sex from '../model/enums/Sex';
import localization from '../model/resources/localization';
import State from '../state/State';

export enum DemoStage {
	Init,
	About,
	Question,
	GiveAnswer,
	Answer,
	AnswerValidation,
	FalseStarts,
	GameRules,
	OtherContent,
	OtherQuestions,
	Opponents,
	Finished,
}

export default class DemoGameClient implements IGameClient {
	shouldClose!: boolean;

	stage: DemoStage = DemoStage.Init;
	isAnswerCorrect: boolean = true;

	constructor(
		private controller: ClientController,
		private getState: () => State,
	) { }

	addTable(): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	apellate(forRightAnswer: boolean): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	approveAnswer(factor: number): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	async changeTableType(isShowman: boolean, tableIndex: number): Promise<boolean> {
		return true;
	}

	deleteTable(tableIndex: number): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	deleteTheme(themeIndex: number): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	freeTable(isShowman: boolean, tableIndex: number): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	getPin(): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	async info(): Promise<boolean> {
		this.controller.onInfo(
			{
				[localization.showman]: {
					name: localization.showman,
					sex: Sex.Male,
					isHuman: false,
					avatar: 'https://vladimirkhil.com/content/images/demo/showman.png',
				},
				[localization.player + ' 1']: {
					name: localization.player + ' 1',
					sex: Sex.Male,
					isHuman: false,
					avatar: 'https://vladimirkhil.com/content/images/demo/player1.png',
				},
				[localization.player + ' 2']: {
					name: localization.player + ' 2',
					sex: Sex.Female,
					isHuman: false,
					avatar: 'https://vladimirkhil.com/content/images/demo/player2.png',
				},
				[this.getState().room2.name]: {
					name: this.getState().room2.name,
					sex: this.getState().settings.sex,
					isHuman: true,
					avatar: null,
				},
			},
			{
				name: localization.showman,
				isReady: true,
				isHuman: false,
				replic: '',
				isDeciding: false,
			},
			[{
				name: localization.player + ' 1',
				isReady: true,
				isHuman: false,
				replic: '',
				isDeciding: false,
				sum: 0,
				stake: 0,
				state: PlayerStates.None,
				canBeSelected: false,
				isChooser: false,
				inGame: true,
				mediaLoaded: false,
				mediaPreloaded: false,
				mediaPreloadProgress: 0,
				answer: '',
			}, {
				name: localization.player + ' 2',
				isReady: true,
				isHuman: false,
				replic: '',
				isDeciding: false,
				sum: 0,
				stake: 0,
				state: PlayerStates.None,
				canBeSelected: false,
				isChooser: false,
				inGame: true,
				mediaLoaded: false,
				mediaPreloaded: false,
				mediaPreloadProgress: 0,
				answer: '',
			}, {
				name: this.getState().room2.name,
				isReady: false,
				isHuman: false,
				replic: '',
				isDeciding: false,
				sum: 0,
				stake: 0,
				state: PlayerStates.None,
				canBeSelected: false,
				isChooser: false,
				inGame: true,
				mediaLoaded: false,
				mediaPreloaded: false,
				mediaPreloadProgress: 0,
				answer: '',
			}]
		);

		this.controller.onHostNameChanged(null, null);

		return true;
	}

	kick(personName: string): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	async leaveGame(): Promise<void> {
		this.stage = DemoStage.Finished;
	}

	markQuestion(questionId: number, comment: string): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	mediaLoaded(): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	mediaPreloadProgress(progress: number): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	mediaPreloaded(): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	async moveable(): Promise<boolean> {
		return true;
	}

	moveNext(): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	moveToRound(roundIndex: number): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	onMediaCompleted(contentType: string, contentValue: string): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	async pass(): Promise<boolean> {
		return true;
	}

	pause(enable: boolean): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	async pressButton(deltaTime: number): Promise<boolean> {
		if (this.stage !== DemoStage.GiveAnswer) {
			return true;
		}

		this.nextStage();
		return true;
	}

	async ready(isReady: boolean): Promise<boolean> {
		this.nextStage();
		return true;
	}

	rejectAnswer(factor: number): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	async say(text: string): Promise<boolean> {
		return true; // Simulate sending a message
	}

	selectChooser(playerIndex: number): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	selectPlayer(playerIndex: number): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	selectQuestion(themeIndex: number, questionIndex: number): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	async sendAnswer(answer: string): Promise<boolean> {
		if (this.stage !== DemoStage.Answer) {
			return false;
		}

		this.isAnswerCorrect = answer.trim().toLocaleLowerCase() === localization.answer.trim().toLocaleLowerCase();
		this.nextStage();
		return true;
	}

	async sendAnswerVersion(answerVersion: string): Promise<boolean> {
		return true;
	}

	async sendAvatar(avatarUri: string): Promise<boolean> {
		return true;
	}

	sendGameReport(reportText: string): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	sendImageAvatar(avatarUri: string): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	sendVideoAvatar(avatarUri: string): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	setChooser(playerIndex: number): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	setHost(personName: string): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	setJoinMode(joinMode: JoinMode): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	setPlayerScore(playerIndex: number, score: number): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	setOption(name: string, value: string): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	setTable(isShowman: boolean, tableIndex: number, name: string): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	stakeAllIn(): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	stakePass(): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	stakeValue(value: number): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	start(): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	toggle(themeIndex: number, questionIndex: number): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	unban(ip: string): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	validateAnswer(answer: string, isRight: boolean): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	private displayText(text: string) {
		const { readingSpeed } = this.getState().settings.appSettings;

		this.controller.onContent('screen', []);

		this.controller.onContent(
			'screen',
			[
				{
					type: 'text',
					value: text,
				},
			]
		);

		window.setTimeout(this.nextStage.bind(this), 1000 * ((text.length / readingSpeed) + 2));
	}

	nextStage() {
		this.stage = this.stage + 1;

		switch (this.stage) {
			case DemoStage.Init:
				break;

			case DemoStage.About:
				this.controller.onStage(GameStage.Started, '', 0, '');

				this.displayText(localization.demoAbout);
				break;

			case DemoStage.Question:
				this.displayText(localization.demoQuestion);
				break;

			case DemoStage.GiveAnswer:
				this.controller.onBeginPressButton();
				break;

			case DemoStage.Answer:
				this.controller.onReplic('s', localization.demoGiveAnswer);
				this.controller.onAskAnswer();
				this.controller.onEndPressButtonByPlayer(2);
				break;

			case DemoStage.AnswerValidation:
				this.controller.onPlayerState(this.isAnswerCorrect ? PlayerStates.Right : PlayerStates.Wrong, [2]);
				this.controller.onSums([0, 0, this.isAnswerCorrect ? 100 : -100]);
				this.controller.onReplic('s', '');

				this.displayText(this.isAnswerCorrect ? localization.demoCorrectAnswer : localization.demoWrongAnswer);
				break;

			case DemoStage.FalseStarts:
				this.displayText(localization.demoFalseStarts);
				break;

			case DemoStage.GameRules:
				this.displayText(localization.demoGameRules);
				break;

			case DemoStage.OtherContent:
				this.displayText(localization.demoOtherContent);
				break;

			case DemoStage.OtherQuestions:
				this.displayText(localization.demoOtherQuestions);
				break;

			case DemoStage.Opponents:
				this.displayText(localization.demoOpponents);
				break;

			case DemoStage.Finished:
				this.controller.onContent(
					'screen',
					[
						{
							type: 'text',
							value: localization.demoFinished,
						},
					]
				);

				break;

			default:
				break;
		}
	}
}