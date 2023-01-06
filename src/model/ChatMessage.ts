import MessageLevel from './enums/MessageLevel';

export default interface ChatMessage {
	sender: string;
	text: string;
	level: MessageLevel;
}
