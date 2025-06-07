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
	Finished,
}

export default class DemoGameClient implements IGameClient {
	gameServerClient!: IClientBase;

	shouldClose!: boolean;

	stage: DemoStage = DemoStage.Init;

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
	}

	markQuestion(questionId: number, comment: string): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	mediaLoaded(): Promise<boolean> {
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

	onMediaCompleted(): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	pass(): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	pause(enable: boolean): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	pressButton(deltaTime: number): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	async ready(isReady: boolean): Promise<boolean> {
		this.stage = DemoStage.Finished;

		this.controller.onStage(GameStage.Started, '', 0, '');

		this.controller.onContent(
			'screen',
			[
				{
					type: 'text',
					value: localization.demoFinished,
				},
			]
		);

		return true;
	}

	rejectAnswer(factor: number): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	async say(text: string): Promise<boolean> {
		return true; // Simulate sending a message
	}

	selectQuestion(themeIndex: number, questionIndex: number): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	sendAnswer(answer: string): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	sendAnswerVersion(answerVersion: string): Promise<boolean> {
		throw new Error('Method not implemented.');
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
}