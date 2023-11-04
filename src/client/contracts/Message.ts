/** Defines an in-game message. */
export default interface Message {
	IsSystem: boolean;
	Sender: string;
	Text: string;
}
